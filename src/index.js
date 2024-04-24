import CryptoJS from 'crypto-js';

var HubspotSignature = function() {
    this.evaluate = function(context) {

        var request = context.getCurrentRequest();
        const { body, url, method } = request;

        const validTimestampHeader = ["v1", "v2", "v3"]
        const versionHeader = request.getHeaderByName("X-HubSpot-Signature-Version")
        if (this.version === 'header' && !validTimestampHeader.includes(versionHeader)) {
            return "** Invalid X-HubSpot-Signature-Version header should be v1, v2 or v3 **";
        }
    
        const versionValue = this.version === "header" ? versionHeader.replace("v", "") : this.version;

        const version = parseInt(versionValue);
  
        if (isNaN(version) || version < 1 || version > 3) {
            return "** Invalid X-HubSpot-Signature-Version header should be v1, v2 or v3 **";
        }

        // https://developers.hubspot.com/docs/api/webhooks/validating-requests
        if (version === 1) {
            const source_string = `${this.secret}${body}`
            const hash = CryptoJS.SHA256(source_string);
            const value = hash.toString(CryptoJS.enc.Hex);
            return value;
        } else if (version === 2) {
            const source_string = this.secret + method + url + body;
            const hash = CryptoJS.SHA256(source_string);
            const value = hash.toString(CryptoJS.enc.Hex);
            return value;
        } else if (version === 3) {

            const timestampHeader = request.getHeaderByName("X-HubSpot-Signature-Timestamp");
            const timestamp = parseInt(timestampHeader);
            if (!timestampHeader || timestampHeader.trim() === "") {
                return "** Missing X-HubSpot-Signature-Timestamp header with unix timestamp (usesValues > Timestamp > Custom Formatting %s000) **";
            }

            if (isNaN(timestamp)) {
                return "** Invalid X-HubSpot-Signature-Timestamp header with unix timestamp (usesValues > Timestamp > Custom Formatting %s000) **";
            }

            const decodedUrl = decodeURIComponent(url);
            // Create a utf-8 encoded string that concatenates together the following: requestMethod + requestUri + requestBody + timestamp. The timestamp is provided by the X-HubSpot-Request-Timestamp header.

            const source_string = method + decodedUrl + body + timestamp;
            const hash = CryptoJS.HmacSHA256(source_string, this.secret);
            const value = hash.toString(CryptoJS.enc.Hex);
            return value;
        }

        return "NOT SUPPORTED"
    };
};



HubspotSignature.inputs = [
    InputField("secret", "Secret", "String", { persisted: true, placeholder: "Enter your hubspot secret key"}),
    InputField("version", "Version", "Select", {"choices": {"1": "Version 1", "2": "Version 2", "3": "Version 3", "header": " X-HubSpot-Signature-Version header value"}, default: 2, persisted: true})
];

HubspotSignature.identifier = "com.hatchhead.HubspotSignature";
HubspotSignature.version = "1.0";
HubspotSignature.title = "Hubspot Signature";
HubspotSignature.help = "https://luckymarmot.com/paw/doc/";

// You can import third-party modules here
// import axios from 'axios';

// You may also define or import additional functions or classes
registerDynamicValueClass(HubspotSignature);

