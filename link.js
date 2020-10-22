import line from '@line/bot-sdk'

const config = {
    channelAccessToken: 'oThSS0dRpWWNegfDp5RO6MPtiNYfeWwmcOJt93e/pwrD1Tx6qGBJapiHCmZjH+GWJ5oCyLWvvaLxeq+RpGlz1wNOU98pNaZ+lrNOec9zSkhbOFw+rSfLQ5RtVShadp/UFCIB7EFTsGf+kUFGLxM2NQdB04t89/1O/w1cDnyilFU=',
    channelSecret: '589de7a74a4bcbab30afe84b55ab193d',
};
const client = new line.Client(config);

client.linkRichMenuToUser('');