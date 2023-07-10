function search() {
    let site = document.getElementById('site').value;
    let file = document.getElementById('file').value;
    let url = document.getElementById('url').value;
    let title = document.getElementById('title').value;
    let text = document.getElementById('text').value;
    let key = document.getElementById('key').value;
    let before = document.getElementById('before').value;
    let after = document.getElementById('after').value;
    let map = document.getElementById('map').value;
    let location = document.getElementById('location').value;
    let define = document.getElementById('define').value;
    let inanchor = document.getElementById('inanchor').value;
    let cache = document.getElementById('cache').value;
    let info = document.getElementById('info').value;
    let related = document.getElementById('related').value;
    let allintitle = document.getElementById('allintitle').value;
    let allinurl = document.getElementById('allinurl').value;
    let allintext = document.getElementById('allintext').value;
    let allinanchor = document.getElementById('allinanchor').value;
    let srch = "https://www.google.co.in/search?q=";
    if (site.length == 0 && file.length == 0 && title.length == 0 && url.length == 0 && text.length == 0 && key.length == 0 && before.length == 0 && after.length == 0 && map.length == 0 && location.length == 0 && define.length == 0 && inanchor.length == 0 && cache.length == 0 && info.length == 0 && related.length == 0 && allintitle.length == 0 && allinurl.length == 0 && allintext.length == 0 && allinanchor.length == 0) {
        alert("Please fill atleast one field");
    } else {
        ok();
    }

    function ok() {
        let array1 = [site, file, url, title, text, key, before, after, map, location, define, inanchor, cache, info, related, allinurl, allintitle, allintext, allinanchor];
        let array2 = ["site:", "filetype:", "inurl:", "intitle:", "intext:", "", "before:", "after:", "map:", "location:", "define", "inanchor:", "cache:", "info:", "related:", "allinurl:", "allintitle:", "allintext:", "allinanchor:"];
        let halfsite = "";
        for (let a = 0; a < 19; a++) {
            if (array1[a].length > 0) {
                halfsite += array2[a] + array1[a] + " ";
            } else {
                continue;
            }
        }
        let gugle_srch = srch + halfsite;
        window.open(gugle_srch);
    }
}
function hide() {
    let a = document.getElementById('a:1');
    let b = document.getElementById('a:2');
    let c = document.getElementById('a:3');
    let d = document.getElementById('a:4');
    let e = document.getElementById('a:5');
    a.style.visibility = 'hidden';
    b.style.visibility = 'hidden';
    c.style.visibility = 'hidden';
    d.style.visibility = 'hidden';
    e.style.visibility = 'hidden';
}
setTimeout(hide, 1);
function show() {
    let a = document.getElementById('a:1');
    let b = document.getElementById('a:2');
    let c = document.getElementById('a:3');
    let d = document.getElementById('a:4');
    let e = document.getElementById('a:5');
    if (a.style.visibility != 'hidden' && b.style.visibility != 'hidden' && c.style.visibility != 'hidden' && d.style.visibility != 'hidden' && e.style.visibility != 'hidden'){
        a.style.visibility = 'hidden';
        b.style.visibility = 'hidden';
        c.style.visibility = 'hidden';
        d.style.visibility = 'hidden';
        e.style.visibility = 'hidden';
    } else {
        a.style.visibility = 'visible';
        b.style.visibility = 'visible';
        c.style.visibility = 'visible';
        d.style.visibility = 'visible';
        e.style.visibility = 'visible';
    }

}
