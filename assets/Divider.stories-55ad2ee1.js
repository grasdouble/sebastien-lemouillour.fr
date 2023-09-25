import{j as r}from"./jsx-runtime-65670fe4.js";import{D as n}from"./index-fb17cd01.js";const l={title:"2. Components/Divider",component:n,parameters:{layout:"centered"},tags:[""],argTypes:{label:{control:"text",description:"The text to display"},position:{control:"radio",description:"The position of the label",options:["left","center","right"]}}},e={args:{label:"This is a divider with label",position:"center"},render:({label:s,position:a})=>r.jsx("div",{className:"w-[40rem]",children:r.jsx(n,{label:s,position:a})})};var t,i,o;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    label: "This is a divider with label",
    position: "center"
  },
  render: ({
    label,
    position
  }) => {
    return <div className="w-[40rem]">
        <Divider label={label} position={position} />
      </div>;
  }
}`,...(o=(i=e.parameters)==null?void 0:i.docs)==null?void 0:o.source}}};const d=["Primary"],m=Object.freeze(Object.defineProperty({__proto__:null,Primary:e,__namedExportsOrder:d,default:l},Symbol.toStringTag,{value:"Module"}));export{m as D};
//# sourceMappingURL=Divider.stories-55ad2ee1.js.map
