import { useRouter } from "next/navigation";
import { toast } from "sonner";

const useAuth = () => {
  const router = useRouter();

  const signOut = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, // special API from CMS
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Signed out Successfully");

      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      toast.error("Could not sign out, please try again");
    }
  };

  return { signOut };
};

export default useAuth;
