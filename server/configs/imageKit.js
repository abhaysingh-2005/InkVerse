import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_adrKENdOZx0w18ZN4KkfN1m8vaI=',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_StfAtc8mGefwcqXnrjxR6kYlPLI=',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/blogabhay'
});

export default imagekit;