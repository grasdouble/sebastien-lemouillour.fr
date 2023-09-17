import{j as e}from"./jsx-runtime-65670fe4.js";import{B as r}from"./index-d102b708.js";const M={title:"2. Components/Badge",component:r,parameters:{layout:"centered"},tags:[""],argTypes:{label:{control:"text",description:"The text to display"},color:{control:"select",description:"The color used in the badge",value:"gray",options:["gray","red","yellow","green","blue","indigo","purple"]},size:{control:"select",description:"The size of the badge",options:["small","medium","large"]}}},a={args:{label:"Marketing",color:"gray",size:"small"}},s={decorators:[()=>e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"red",label:"Backend"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"yellow",label:"QA"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"green",label:"Design"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"blue",label:"DevOps"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"indigo",label:"UX"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,color:"purple",label:"Product"})})]})]},l={decorators:[()=>e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,label:"small"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,size:"medium",label:"medium"})}),e.jsx("span",{style:{margin:"0.5em"},children:e.jsx(r,{...a.args,size:"large",label:"large"})})]})]},n={args:{label:"Backend",color:"red",size:"small"}},o={args:{label:"QA",color:"yellow",size:"small"}},g={args:{label:"Design",color:"green",size:"small"}},c={args:{label:"DevOps",color:"blue",size:"small"}},d={args:{label:"UX",color:"indigo",size:"small"}},t={args:{label:"Product",color:"purple",size:"small"}};var m,i,p;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: "Marketing",
    color: "gray",
    size: "small"
  }
}`,...(p=(i=a.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var u,y,B;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  decorators: [() => <>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="red" label="Backend" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="yellow" label="QA" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="green" label="Design" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="blue" label="DevOps" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="indigo" label="UX" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} color="purple" label="Product" />
        </span>
      </>]
}`,...(B=(y=s.parameters)==null?void 0:y.docs)==null?void 0:B.source}}};var b,x,j;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  decorators: [() => <>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} label="small" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} size="medium" label="medium" />
        </span>
        <span style={{
      margin: "0.5em"
    }}>
          <Badge {...GrayBadge.args} size="large" label="large" />
        </span>
      </>]
}`,...(j=(x=l.parameters)==null?void 0:x.docs)==null?void 0:j.source}}};var z,h,G;n.parameters={...n.parameters,docs:{...(z=n.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    label: "Backend",
    color: "red",
    size: "small"
  }
}`,...(G=(h=n.parameters)==null?void 0:h.docs)==null?void 0:G.source}}};var S,A,D;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: "QA",
    color: "yellow",
    size: "small"
  }
}`,...(D=(A=o.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};var w,O,P;g.parameters={...g.parameters,docs:{...(w=g.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: "Design",
    color: "green",
    size: "small"
  }
}`,...(P=(O=g.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var f,k,v;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "DevOps",
    color: "blue",
    size: "small"
  }
}`,...(v=(k=c.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};var _,T,Q;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: "UX",
    color: "indigo",
    size: "small"
  }
}`,...(Q=(T=d.parameters)==null?void 0:T.docs)==null?void 0:Q.source}}};var U,X,C;t.parameters={...t.parameters,docs:{...(U=t.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    label: "Product",
    color: "purple",
    size: "small"
  }
}`,...(C=(X=t.parameters)==null?void 0:X.docs)==null?void 0:C.source}}};const R=["GrayBadge","AllColors","AllSize","RedBadge","YellowBadge","GreenBadge","BlueBadge","IndigoBadge","PurpleBadge"],I=Object.freeze(Object.defineProperty({__proto__:null,AllColors:s,AllSize:l,BlueBadge:c,GrayBadge:a,GreenBadge:g,IndigoBadge:d,PurpleBadge:t,RedBadge:n,YellowBadge:o,__namedExportsOrder:R,default:M},Symbol.toStringTag,{value:"Module"}));export{s as A,I as B,l as a};
//# sourceMappingURL=Badge.stories-87ca4042.js.map
