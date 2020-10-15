/*  Helper function to automatically initialize and run an instance
 *  of ngrok.
 */
const ngrok = require('ngrok');

const config = {
    name: "webxr-dev-server",
    port: 8080,
};

(async () => {
    ngrok.connect(config)
        .then((url) => {
            console.log(`🚀 Your ngrok tunnel is live at: \x1b[32m${url}`);
        })
        .catch((err) => {
            console.log("\x1b[31m", `Unable to start ngrok. Error: ${err} `)
        });
})();