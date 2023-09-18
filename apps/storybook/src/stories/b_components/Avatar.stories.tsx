import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "@grasdouble/ui";
import { AvatarProps } from "@grasdouble/ui/src/components/Avatar/Avatar";

type AvatarPropsAndCustomArgs = React.ComponentProps<typeof Avatar> &
  AvatarProps["avatar"] &
  AvatarProps["notification"];

const meta = {
  title: "2. Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: [""],
} satisfies Meta<AvatarPropsAndCustomArgs>;

export default meta;
type Story = StoryObj<AvatarPropsAndCustomArgs>;

const hiddenArgTypes = {
  avatar: {
    table: {
      category: "Avatar",
      disable: true,
    },
  },
  notification: {
    table: {
      category: "Notification",
      disable: true,
    },
  },
  size: {
    table: {
      category: "Notification",
      disable: true,
    },
  },
};

export const Primary: Story = {
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    ...hiddenArgTypes,
    size: {
      control: "select",
      description: "The size of the avatar",
      options: [
        "small",
        "medium",
        "large",
        "xlarge",
        "2xlarge",
        "3xlarge",
        "4xlarge",
      ],
    },
    type: {
      control: "radio",
      description: "The type of the avatar",
      options: ["circle", "square"],
      name: "avatar.type",
      table: {
        category: "Avatar",
        type: {
          summary: "circle | square",
        },
        defaultValue: {
          summary: "circle",
        },
      },
    },
    imgURL: {
      control: "text",
      description: "The image URL of the avatar",
      name: "avatar.imgURL",
      table: {
        category: "Avatar",
      },
      type: {
        required: true,
        name: "string",
      },
    },
    color: {
      control: "radio",
      description: "The color of the notification",
      options: ["none", "green", "orange", "red", "gray"],
      name: "notification.color",
      table: {
        category: "Notification",
        type: {
          summary: "none | green | orange | red | gray",
        },
        defaultValue: {
          summary: "none",
        },
      },
    },
    position: {
      control: "radio",
      description: "The position of the notification",
      options: ["top", "bottom"],
      name: "notification.position",
      table: {
        category: "Notification",
        type: {
          summary: "top | bottom",
        },
        defaultValue: {
          summary: "top",
        },
      },
    },
  },
  args: {
    size: "xlarge",
    type: "circle",
    imgURL:
      "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    color: "none",
    position: "top",
  },
  render: ({ type, imgURL, color, position, ...args }) => {
    args.avatar = {
      type,
      imgURL,
    };
    args.notification = {
      color,
      position,
    };

    return <Avatar {...args} />;
  },
};

const avatarCircle: AvatarProps["avatar"] = {
  type: "circle",
  imgURL:
    "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
const avatarSquare: AvatarProps["avatar"] = {
  type: "square",
  imgURL:
    "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export const AllSize = {
  argTypes: {
    ...hiddenArgTypes,
    type: {
      control: "radio",
      description: "The type of the avatar",
      options: ["circle", "square"],
      name: "avatar.type",
      table: {
        type: {
          summary: "circle | square",
        },
        defaultValue: {
          summary: "circle",
        },
      },
    },
  },
  args: {
    type: "circle",
  },
  render: ({ type }: AvatarPropsAndCustomArgs) => {
    return (
      <center>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="small" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="medium" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="large" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="xlarge" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="2xlarge" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="3xlarge" />
        </span>
        <span style={{ margin: "0.5em" }}>
          <Avatar avatar={{ ...avatarCircle, type }} size="4xlarge" />
        </span>
      </center>
    );
  },
};

export const AllNotificationColors = {
  argTypes: {
    ...hiddenArgTypes,
    position: {
      control: "radio",
      description: "The position of the notification",
      options: ["top", "bottom"],
      name: "notification.position",
      table: {
        type: {
          summary: "top | bottom",
        },
        defaultValue: {
          summary: "top",
        },
      },
    },
  },
  args: {
    position: "top",
  },
  render: ({ position }: AvatarPropsAndCustomArgs) => {
    const notification = {
      position: position,
      color: "none",
    };

    return (
      <center>
        <div className="mb-5">
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarCircle}
              notification={{
                ...notification,
                color: "green",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarCircle}
              notification={{
                ...notification,
                color: "orange",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarCircle}
              notification={{
                ...notification,
                color: "red",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarCircle}
              notification={{
                ...notification,
                color: "gray",
              }}
              size="xlarge"
            />
          </span>
        </div>
        <div>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarSquare}
              notification={{
                ...notification,
                color: "green",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarSquare}
              notification={{
                ...notification,
                color: "orange",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarSquare}
              notification={{
                ...notification,
                color: "red",
              }}
              size="xlarge"
            />
          </span>
          <span style={{ margin: "0.5em" }}>
            <Avatar
              avatar={avatarSquare}
              notification={{
                ...notification,
                color: "gray",
              }}
              size="xlarge"
            />
          </span>
        </div>
      </center>
    );
  },
};