import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/site", "/api/uploadthing"], //we named the "site", which same inside our (main)->site folder   src->app->api folder -> uploadthing folder
  debug: false,
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    //rewrite for domains
    const url = req.nextUrl; //Retrieves the URL from the request object.
    const searchParams = url.searchParams.toString(); //Converts the URL's search parameters into a string.
    let hostname = req.headers; //: Retrieves the hostname from the request headers.

    const pathWithSearchparams = `${url.pathname}${
      //Retrieves the pathname from the url object.
      searchParams.length > 0 ? `${searchParams}` : "" // Checks if there are any search parameters in the URL. If the length of searchParams is greater than 0, it includes the search parameters; otherwise, it includes an empty string.
    }`;

    //if subdomain exits
    const customSubDomain = hostname
      .get("host") // Retrieves the host from the hostname object
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`) //Splits the host based on the value of NEXT_PUBLIC_DOMAIN environment variable. The ?. operator ensures that if hostname.get("host") is undefined, the split method won't throw an error.
      .filter(Boolean)[0]; // Filters out any falsy values (like null or undefined) from the resulting array and selects the first element.

    if (customSubDomain) {
      return NextResponse.rewrite(
        // Returns a rewritten URL using NextResponse.rewrite() method.
        new URL(`/${customSubDomain}${pathWithSearchparams}`, req.url)
        //Constructs a new URL by combining the custom subdomain (/${customSubDomain}) with the path and search parameters (${pathWithSearchparams}) from the original URL.req.url: Passes the original URL as a base URL for the rewrite.
      );
    }

    //Checks if the current pathname in the URL is either "/sign-in" or "/sign-up".
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
    }

    //This if statement checks two conditions using logical operators (|| for OR and && for AND).
    //If the URL's pathname is '/' (root path) OR If the URL's pathname is '/site' AND the URL's host matches the value of the NEXT_PUBLIC_DOMAIN environment variable.
    //Inside the code block, it rewrites the URL to /site.
    if (
      url.pathname === "/" ||
      (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL("/site", req.url));
    }

    //This if statement checks if the URL's pathname starts with '/agency' OR '/subaccount'.
    //if yes, it rewrites the URL to the value of pathWithSearchParams, which is constructed earlier in the code.
    if (
      url.pathname.startsWith("/agency") ||
      url.pathname.startsWith("/subaccount")
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchparams}`, req.url));
    }
  },
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
