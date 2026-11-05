#!/usr/bin/env python3
"""يجمّع مصادر فِكْر زُون في ملف HTML واحد يعمل أوفلاين (الخطوط مضمّنة base64)."""
import base64, glob, hashlib, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
FONTS = os.path.join(ROOT, 'fonts', 'node_modules', '@fontsource')

LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
ARAB = 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC'


def b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()


def face(family, weight, pkg, name, script, rng):
    p = os.path.join(FONTS, pkg, 'files', f'{name}-{script}-{weight}-normal.woff2')
    return (f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;"
            f"src:url(data:font/woff2;base64,{b64(p)}) format('woff2');unicode-range:{rng}}}\n")


def fonts_css():
    out = ''
    for w in (400, 600):
        for script, rng in (('arabic', ARAB), ('latin', LATIN)):
            out += face('MV Plex', w, 'ibm-plex-sans-arabic', 'ibm-plex-sans-arabic', script, rng)
    for script, rng in (('arabic', ARAB), ('latin', LATIN)):
        out += face('MV Kufi', 600, 'reem-kufi', 'reem-kufi', script, rng)
    return out


def main():
    order = sorted(glob.glob(os.path.join(SRC, '*.js')))
    js = '\n'.join(open(p, encoding='utf-8').read() for p in order)
    css = '\n'.join(open(p, encoding='utf-8').read() for p in sorted(glob.glob(os.path.join(SRC, '*.css'))))
    html = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
    html = html.replace('/*{{FONTS}}*/', fonts_css()).replace('/*{{CSS}}*/', css)
    # الـ replace بـ lambda كي لا تُفسَّر \ في الجافاسكربت
    html = re.sub(r'/\*\{\{JS\}\}\*/', lambda m: js, html)
    out = os.path.join(ROOT, 'dist', 'fikrzone.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)   # ملف واحد مستقل (يعمل بالنقر المزدوج بدون خادم)
    # نسخة الويب القابلة للتثبيت (PWA): index.html + manifest + service worker
    ver = hashlib.sha1(html.encode('utf-8')).hexdigest()[:10]
    pwa_head = ('<link rel="manifest" href="manifest.webmanifest">\n'
                '<link rel="icon" type="image/png" sizes="48x48" href="icons/favicon-48.png">\n'
                '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
                '<meta name="mobile-web-app-capable" content="yes">\n'
                '<meta name="apple-mobile-web-app-capable" content="yes">\n'
                '<meta name="apple-mobile-web-app-title" content="فِكْر زُون">\n'
                '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n')
    pwa_reg = ("<script>if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!/mvtest/.test(location.search))"
               "{window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>\n")
    web = html.replace('<style>', pwa_head + '<style>', 1).replace('</body>', pwa_reg + '</body>', 1)
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(web)
    sw = open(os.path.join(ROOT, 'pwa', 'sw.template.js'), encoding='utf-8').read().replace('__VER__', ver)
    with open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(sw)
    print('OK', out, round(len(html) / 1024), 'KB', len(order), 'js files')


if __name__ == '__main__':
    main()
