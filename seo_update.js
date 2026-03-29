const fs = require('fs');
const cheerio = require('cheerio');

// Read file, remove BOM if present
let html = fs.readFileSync('index.html', 'utf8');
if (html.charCodeAt(0) === 0xFEFF) {
    html = html.substring(1);
}

// Fix missing DOCTYPE
if (!html.trim().toLowerCase().startsWith('<!doctype')) {
    html = '<!DOCTYPE html>\n' + html;
}

const $ = cheerio.load(html);

// 1. JSON-LD

// FAQPage Schema
let faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": []
};
$('.issue').each((i, el) => {
    let question = $(el).find('.issue-title').text().replace(/^\s*\.\s*/, '').trim();
    let answerHtml = '';
    $(el).find('.issue-meta, p, pre').each((j, child) => {
        answerHtml += $.html(child) + '\n';
    });
    faqSchema.mainEntity.push({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": answerHtml.trim()
        }
    });
});

// HowTo Schema
let howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Install OpenClaw on Windows Manually",
    "step": []
};
$('h3[id^="step"]').each((i, el) => {
    let title = $(el).text().trim();
    let text = $(el).nextUntil('h3, hr, h2').text().trim();
    howToSchema.step.push({
        "@type": "HowToStep",
        "name": title,
        "text": text
    });
});

// SoftwareApplication Schema
let appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChatterPC",
    "operatingSystem": "Windows 10, Windows 11",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    }
};

// Add JSON-LD to head if not present
if ($('script[type="application/ld+json"]').length === 0) {
    $('head').append(`
<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(howToSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(appSchema, null, 2)}
</script>
`);
}

// 2. Missing meta tags
const metaTags = [
    '<meta name="robots" content="index, follow">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="OpenClaw on Windows - Community Installation Guide">',
    '<meta name="twitter:description" content="One-click installer, manual npm guide, WSL2 setup, and fixes for 13+ common Windows issues.">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="OpenClaw Windows Guide">',
    '<meta property="og:image" content="https://keugenek.github.io/clawhome/og-image.png">',
    '<meta name="author" content="Evgeny Knyazev">',
    '<link rel="preconnect" href="https://static.cloudflareinsights.com">'
];

metaTags.forEach(tag => {
    let match = tag.match(/name="([^"]+)"/);
    if (!match) match = tag.match(/property="([^"]+)"/);
    if (!match) match = tag.match(/rel="preconnect" href="([^"]+)"/);
    
    if (match) {
        let attr = tag.includes('property') ? 'property' : (tag.includes('rel="preconnect"') ? 'href' : 'name');
        if ($(`head [${attr}="${match[1]}"]`).length === 0) {
            $('head').append(tag + '\n');
        }
    }
});

// 5. Semantic HTML improvements
$('html').attr('lang', 'en');

// Wrap main content in <article>
if ($('main.content > article').length === 0) {
    $('main.content').wrapInner('<article aria-label="OpenClaw Windows Installation Guide"></article>');
}

// 6. Heading hierarchy audit
// Sidebar h4 -> h2
$('aside.sidebar h4').each((i, el) => {
    $(el).replaceWith($('<h2>').append($(el).contents()).attr('class', $(el).attr('class') || ''));
});
// Update CSS
let css = $('style').html();
if (css) {
    css = css.replace(/\.sidebar h4/g, '.sidebar h2');
    $('style').html(css);
}

// 8. Internal anchor optimization
const idMap = {
    'install': 'install-openclaw-windows',
    'option-chatterpc': 'install-via-chatterpc',
    'option-manual': 'manual-install-windows',
    'option-wsl2': 'wsl2-install-guide',
    'prereqs': 'manual-prerequisites',
    'step1': 'manual-step-1-install',
    'step2': 'manual-step-2-onboarding',
    'step3': 'manual-step-3-gateway',
    'step4': 'manual-step-4-telegram',
    'step5': 'manual-step-5-verify',
    'wsl-prereqs': 'wsl2-prerequisites',
    'wsl-step1': 'wsl2-step-1-install',
    'wsl-step2': 'wsl2-step-2-systemd',
    'wsl-step3': 'wsl2-step-3-install',
    'wsl-step4': 'wsl2-step-4-onboarding',
    'wsl-step5': 'wsl2-step-5-telegram',
    'wsl-autostart': 'wsl2-autostart-windows',
    'wsl-network': 'wsl2-network-lan-access',
    'wsl-issues': 'wsl2-common-issues',
    'issues': 'common-windows-issues',
    'commands': 'useful-openclaw-commands',
    'help': 'get-openclaw-help'
};

Object.keys(idMap).forEach(oldId => {
    let newId = idMap[oldId];
    $(`[id="${oldId}"]`).attr('id', newId);
    $(`a[href="#${oldId}"]`).attr('href', '#' + newId);
    
    // Also update JS observer query string if it references the exact ID, but the JS uses IntersectionObserver which grabs target.id
    // It should just work natively since it reads target.id.
});

// Fix image alts just in case
$('img').each((i, el) => {
    if (!$(el).attr('alt') || $(el).attr('alt').trim() === '') {
        $(el).attr('alt', 'Illustration');
    }
});

fs.writeFileSync('index.html', $.html(), 'utf8');
console.log('SEO improvements applied.');
