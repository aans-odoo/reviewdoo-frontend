const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!DOCTYPE html><html></html>");
const { DOMParser, Document, XPathResult, Node, document } = dom.window;
global.XPathResult = XPathResult;
global.Node = Node;
global.Document = Document;

const parser = new DOMParser();

const parentXml = `<t t-name="web.AutoComplete">
  <div class="o-autocomplete" t-custom-ref="root" t-att-class="this.autoCompleteRootClass">
    <input type="text" class="o-autocomplete--input o_input pe-3 text-truncate" t-custom-model="this.state.value" t-custom-ref="input"/>
  </div>
</t>`;

const childXml = `<t t-name="website.AutoCompleteBuilderUrlPicker" t-inherit="web.AutoComplete">
  <xpath expr="//div[@t-custom-ref='root']" position="attributes">
    <attribute name="t-att-data-action-id">this.info.actionId</attribute>
  </xpath>
  <xpath expr="//input[@t-custom-ref='input']" position="attributes">
    <attribute name="t-attf-class" add="{{this.props.inputClass}}" separator=" "/>
  </xpath>
</t>`;

function parse(xml) {
  return parser.parseFromString(xml, "text/xml").firstChild;
}

function getRoot(element) {
  while (element.parentElement) element = element.parentElement;
  return element;
}

function getNode(element, operation) {
  const root = getRoot(element);
  const doc = new Document();
  doc.appendChild(root);
  if (operation.tagName === "xpath") {
    const xpath = operation.getAttribute("expr");
    const result = doc.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
    return result.singleNodeValue;
  }
}

const parent = parse(parentXml);
const child = parse(childXml);

for (const operation of child.children) {
  const target = getNode(parent, operation);
  console.log("operation expr:", operation.getAttribute("expr"), "=> matched:", target ? target.tagName : "NULL");
}
