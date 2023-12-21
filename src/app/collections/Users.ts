import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: "role", // two types of users: Admins and users (sellers and buyers)
      defaultValue: "user", // by default the user is normal user
      required: true,
      // admin: {
      //   condition: () => false, // we set it to false to not show it to normal users, only for admins
      // },
      type: "select",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
};
