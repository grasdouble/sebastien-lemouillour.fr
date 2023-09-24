import{j as a}from"./jsx-runtime-65670fe4.js";import{A as n}from"./index-bc2d9297.js";const z={title:"2. Components/Avatar",component:n,parameters:{layout:"centered"},tags:[""]},m={avatar:{table:{category:"Avatar",disable:!0}},notification:{table:{category:"Notification",disable:!0}},size:{table:{category:"Notification",disable:!0}}},i={argTypes:{...m,size:{control:"select",description:"The size of the avatar",options:["small","medium","large","xlarge","2xlarge","3xlarge","4xlarge"]},variant:{control:"radio",description:"The variant of the avatar",options:["circle","square"],name:"avatar.variant",table:{category:"Avatar",type:{summary:"circle | square"},defaultValue:{summary:"circle"}}},imgURL:{control:"text",description:"The image URL of the avatar",name:"avatar.imgURL",table:{category:"Avatar"},type:{required:!0,name:"string"}},color:{control:"radio",description:"The color of the notification",options:["none","green","orange","red","gray"],name:"notification.color",table:{category:"Notification",type:{summary:"none | green | orange | red | gray"},defaultValue:{summary:"none"}}},position:{control:"radio",description:"The position of the notification",options:["top","bottom"],name:"notification.position",table:{category:"Notification",type:{summary:"top | bottom"},defaultValue:{summary:"top"}}}},args:{size:"xlarge",variant:"circle",imgURL:"https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",color:"none",position:"top"},render:({variant:r,imgURL:t,color:b,position:j,...l})=>(l.avatar={variant:r,imgURL:t},l.notification={color:b,position:j},a.jsx(n,{...l}))},e={variant:"circle",imgURL:"https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"},c={variant:"square",imgURL:"https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"},o={argTypes:{...m,variant:{control:"radio",description:"The type of the avatar",options:["circle","square"],name:"avatar.variant",table:{type:{summary:"circle | square"},defaultValue:{summary:"circle"}}}},args:{variant:"circle"},render:({variant:r})=>a.jsxs("center",{children:[a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"small"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"medium"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"large"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"2xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"3xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:{...e,variant:r},size:"4xlarge"})})]})},s={argTypes:{...m,position:{control:"radio",description:"The position of the notification",options:["top","bottom"],name:"notification.position",table:{type:{summary:"top | bottom"},defaultValue:{summary:"top"}}}},args:{position:"top"},render:({position:r})=>{const t={position:r,color:"none"};return a.jsxs("center",{children:[a.jsxs("div",{className:"mb-5",children:[a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:e,notification:{...t,color:"green"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:e,notification:{...t,color:"orange"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:e,notification:{...t,color:"red"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:e,notification:{...t,color:"gray"},size:"xlarge"})})]}),a.jsxs("div",{children:[a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:c,notification:{...t,color:"green"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:c,notification:{...t,color:"orange"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:c,notification:{...t,color:"red"},size:"xlarge"})}),a.jsx("span",{style:{margin:"0.5em"},children:a.jsx(n,{avatar:c,notification:{...t,color:"gray"},size:"xlarge"})})]})]})}};var p,g,d;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    ...hiddenArgTypes,
    size: {
      control: "select",
      description: "The size of the avatar",
      options: ["small", "medium", "large", "xlarge", "2xlarge", "3xlarge", "4xlarge"]
    },
    variant: {
      control: "radio",
      description: "The variant of the avatar",
      options: ["circle", "square"],
      name: "avatar.variant",
      table: {
        category: "Avatar",
        type: {
          summary: "circle | square"
        },
        defaultValue: {
          summary: "circle"
        }
      }
    },
    imgURL: {
      control: "text",
      description: "The image URL of the avatar",
      name: "avatar.imgURL",
      table: {
        category: "Avatar"
      },
      type: {
        required: true,
        name: "string"
      }
    },
    color: {
      control: "radio",
      description: "The color of the notification",
      options: ["none", "green", "orange", "red", "gray"],
      name: "notification.color",
      table: {
        category: "Notification",
        type: {
          summary: "none | green | orange | red | gray"
        },
        defaultValue: {
          summary: "none"
        }
      }
    },
    position: {
      control: "radio",
      description: "The position of the notification",
      options: ["top", "bottom"],
      name: "notification.position",
      table: {
        category: "Notification",
        type: {
          summary: "top | bottom"
        },
        defaultValue: {
          summary: "top"
        }
      }
    }
  },
  args: {
    size: "xlarge",
    variant: "circle",
    imgURL: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    color: "none",
    position: "top"
  },
  render: ({
    variant,
    imgURL,
    color,
    position,
    ...args
  }) => {
    args.avatar = {
      variant,
      imgURL
    };
    args.notification = {
      color,
      position
    };
    return <Avatar {...args} />;
  }
}`,...(d=(g=i.parameters)==null?void 0:g.docs)==null?void 0:d.source}}};var v,y,f;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  argTypes: {
    ...hiddenArgTypes,
    variant: {
      control: "radio",
      description: "The type of the avatar",
      options: ["circle", "square"],
      name: "avatar.variant",
      table: {
        type: {
          summary: "circle | square"
        },
        defaultValue: {
          summary: "circle"
        }
      }
    }
  },
  args: {
    variant: "circle"
  },
  render: ({
    variant
  }: AvatarPropsAndCustomArgs) => {
    return <center>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="small" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="medium" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="large" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="xlarge" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="2xlarge" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="3xlarge" />
        </span>
        <span style={{
        margin: "0.5em"
      }}>
          <Avatar avatar={{
          ...avatarCircle,
          variant
        }} size="4xlarge" />
        </span>
      </center>;
  }
}`,...(f=(y=o.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var u,x,h;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  argTypes: {
    ...hiddenArgTypes,
    position: {
      control: "radio",
      description: "The position of the notification",
      options: ["top", "bottom"],
      name: "notification.position",
      table: {
        type: {
          summary: "top | bottom"
        },
        defaultValue: {
          summary: "top"
        }
      }
    }
  },
  args: {
    position: "top"
  },
  render: ({
    position
  }: AvatarPropsAndCustomArgs) => {
    const notification = {
      position: position,
      color: "none"
    };
    return <center>
        <div className="mb-5">
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarCircle} notification={{
            ...notification,
            color: "green"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarCircle} notification={{
            ...notification,
            color: "orange"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarCircle} notification={{
            ...notification,
            color: "red"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarCircle} notification={{
            ...notification,
            color: "gray"
          }} size="xlarge" />
          </span>
        </div>
        <div>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarSquare} notification={{
            ...notification,
            color: "green"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarSquare} notification={{
            ...notification,
            color: "orange"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarSquare} notification={{
            ...notification,
            color: "red"
          }} size="xlarge" />
          </span>
          <span style={{
          margin: "0.5em"
        }}>
            <Avatar avatar={avatarSquare} notification={{
            ...notification,
            color: "gray"
          }} size="xlarge" />
          </span>
        </div>
      </center>;
  }
}`,...(h=(x=s.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const A=["Primary","AllSize","AllNotificationColors"],C=Object.freeze(Object.defineProperty({__proto__:null,AllNotificationColors:s,AllSize:o,Primary:i,__namedExportsOrder:A,default:z},Symbol.toStringTag,{value:"Module"}));export{C as A,o as a,s as b};
//# sourceMappingURL=Avatar.stories-9e33e9ff.js.map
