import { User } from "../../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

const addUser: BeforeChangeHook = ({ req, data }) => {
  // whenever product file created, we are adding this field down, and setting the correct user attached to the product
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;

  if (user?.role === "admin") return true;
  if (!user) return false;

  // when the user is allowed to read from this file (the user who is making req from this function)
  const { docs: products } = await req.payload.find({
    collection: "products", // need to run generate:types
    depth: 0, // when we search for products, each product attach to user by the id, using 1 we fetch the entire User that attach to this prodcut
    where: {
      // filter products for users that own this prodcuts === user.id
      user: {
        equals: user.id,
      },
    },
  });

  const ownProductFileIds = products.map((prod) => prod.product_files).flat(); // flat to make sure that is array of ids

  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 2, // fetching multiple levels of data (id of user and their products)
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFilesIds = orders
    .map((order) => {
      return order.products.map((product) => {
        if (typeof product === "string")
          return req.payload.logger.error(
            "Search depth not sufficient to find purchased file IDs"
          );

        return typeof product.product_files === "string"
          ? product.product_files
          : product.product_files.id;
      });
    })
    .filter(Boolean)
    .flat();

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFilesIds],
    },
  };
};

export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased, // the user can only read the files that he own or purchased
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  upload: {
    staticURL: "/product_files",
    staticDir: "product_files",
    mimeTypes: ["image/*", "font/*", "application/postscript"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: () => false,
      },
      hasMany: false, // one product belongs to one user
      required: true,
    },
  ],
};
