import { PRODUCT_CATEGORIES } from "../../../config/index";
import { CollectionConfig } from "payload/types";

export const Products: CollectionConfig = {
  slug: "products", //name
  admin: {
    useAsTitle: "name", // for admin dashboard
  },
  access: {},
  fields: [
    {
      name: "user", // created User
      type: "relationship",
      relationTo: "users", // users the other collection
      required: true, // imp to have user with products
      hasMany: false, // one product cannot be created by many people
      admin: {
        condition: () => false, // hide this field from admin dashboard
      },
    },
    {
      name: "name", //product name
      label: "Name", // label in admin dashboard
      type: "text",
      required: true,
    },
    {
      name: "description", //product name
      type: "textarea",
      label: "Product Details", // label in admin dashboard
      required: true,
    },
    {
      name: "price", //product name
      label: "Price in USD", // label in admin dashboard
      min: 0,
      max: 1000,
      type: "number",
      required: true,
    },
    {
      name: "category", //product name
      label: "Category", // label in admin dashboard
      type: "select",
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    // {
    //   name: "product_files", //product name
    //   label: "Product file(s)", // label in admin dashboard
    //   type: "relationship",
    //   required: true,
    //   relationTo: "product_files",
    //   hasMany: false,
    // },
    {
      name: "approvedForSales", // admins only approve for this NOT users
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      access: {
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending Verification",
          value: "pending",
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Denied",
          value: "denied",
        },
      ],
    },
    {
      // each product should have id
      name: "priceId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      // each product should have id
      name: "images",
      type: "array",
      label: "Product Images",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
