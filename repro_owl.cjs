const { JSDOM } = require("jsdom");
const fs = require("fs");
const owlSrc = fs.readFileSync("/home/odoo/odoo19/community/addons/web/static/lib/owl/owl.js","utf8");

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
  runScripts: "dangerously",
});
const w = dom.window;
w.requestAnimationFrame = (cb)=>setTimeout(()=>cb(Date.now()),0);
w.cancelAnimationFrame = (id)=>clearTimeout(id);

// inject owl into the window
const script = w.document.createElement("script");
script.textContent = owlSrc;
w.document.body.appendChild(script);

const owl = w.owl;
console.log("owl version:", owl.version);

const test = `
  const { Component, App, xml } = owl;
  class Test extends Component {
    static template = xml\`<input class="o-autocomplete--input o_input pe-3" t-attf-class="{{this.extra}}"/>\`;
    get extra(){ return "o-hb-input-base o_builder_url_input"; }
  }
  window.__run = async function(){
    const app = new App(Test, { test: true });
    const el = document.getElementById("app");
    await app.mount(el);
    return { html: el.innerHTML, cls: el.querySelector("input").className };
  };
`;
const s2 = w.document.createElement("script");
s2.textContent = test;
w.document.body.appendChild(s2);

w.__run().then(r => {
  console.log("RENDERED:", r.html);
  console.log("INPUT CLASS:", r.cls);
}).catch(e => console.log("ERROR:", e && e.message, e && e.stack));
