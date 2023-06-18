import { Route53ClientConfig } from "@aws-sdk/client-route-53";

export const hostedZoneId: string | undefined = process.env.HOSTED_ZONE_ID;
export const domainName: string | undefined = process.env.DOMAIN_NAME;
export const awsAccessKeyID: string | undefined = process.env.AWS_ACCESS_KEY_ID;
export const awsSecretAccessKey: string | undefined = process.env.AWS_SECRET_ACCESS_KEY;
export const updateInterval: number = parseInt(process.env.UPDATE_INTERVAL || "10") * 1000;

export const route53ClientConfig: Route53ClientConfig = {
  region: "global",
  credentials: {
    accessKeyId: awsAccessKeyID || "",
    secretAccessKey: awsSecretAccessKey || "",
  },
}