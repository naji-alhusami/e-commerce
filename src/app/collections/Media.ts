import { Access, CollectionConfig } from "payload/types";
import { User } from "../../payload-types";

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) {
      // if no user
      return false; // false is you cannot access images, true you can access images
    }

    if (user.role === "admin") return true; // this is the main admin not user admin

    return {
      user: {
        // if this user owns this image (this user same in fields down which we set for him the images in beforeChange)
        //  if the image user field equals currently logged in user, so it is your image
        equals: req.user.id,
      },
    };
  };

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    beforeChange: [
      // we connect the images directly with the user
      ({ req, data }) => {
        return { ...data, user: req.user.id };
      },
    ],
  },
  access: {
    // this to not collect all medias together for all users (each user can access his media)
    read: async ({ req }) => {
      const referer = req.headers.referer; // referer (containes where your req comes from)
      if (!req.user || !referer?.includes("sell")) {
        // first check if the user is not logged in (they can read all images on frontend) so the check will only fail in admin dashboard, that's means that if you are on frontend you can see all images but on backend you cannot
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages()
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  upload: {
    staticURL: "/media",
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre", // the centre from docs!!!
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined, // calculate the height automatically
        position: "centre",
      },
    ],
    mimeTypes: ["image/*"], // except all the types of the images (.png, .jpg, ...)
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false, // one image belongs to one user
      admin: {
        condition: () => false,
      },
    },
  ],
};
