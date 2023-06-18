import { ChangeResourceRecordSetsCommand, ListResourceRecordSetsCommand, ListResourceRecordSetsCommandInput, ListResourceRecordSetsResponse, ResourceRecord, ResourceRecordSet, Route53Client } from "@aws-sdk/client-route-53";
import { route53ClientConfig, hostedZoneId, updateInterval, domainName } from "./config";

const client = new Route53Client(route53ClientConfig);

const getExternalIp = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const { ip } = await response.json();
    return ip;
  } catch (error) {
    throw new Error(`Failed to get external IP: ${error}`);
  }
}

const updateRecord = async (ip: string) => {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: domainName,
            ResourceRecords: [
              {
                Value: ip
              }
            ],
            TTL: 60,
            Type: "A"
          }
        }
      ],
      Comment: "Update Hosted Zone A record"
    },
    HostedZoneId: hostedZoneId,
  };
  return await client.send(new ChangeResourceRecordSetsCommand(params));
}

const getRecord = async (): Promise<ListResourceRecordSetsResponse> => {
  const params: ListResourceRecordSetsCommandInput = {
    HostedZoneId: hostedZoneId,
    StartRecordName: domainName,
    StartRecordType: "A",
    MaxItems: 1,
  };

  return await client.send(new ListResourceRecordSetsCommand(params));
}

const getCurrentRoute53IP = async (): Promise<string | null> => {
  const record = await getRecord();

  const resourceRecordSets: ResourceRecordSet[] | undefined = record.ResourceRecordSets;
  if (resourceRecordSets) {
    const resourceRecords: ResourceRecord[] | undefined = resourceRecordSets[0].ResourceRecords;
    if (resourceRecords) {
      const currentIP = resourceRecords[0].Value;
      return currentIP ? currentIP : null;
    }

    throw new Error("No resource records found");
  }

  throw new Error("No resource record sets found");
}

const checkForUpdate = async () => {
  console.log(`[${new Date().toISOString()}] Checking for update`);
  const [ip, route53IP] = await Promise.all([getExternalIp(), getCurrentRoute53IP()]);

  console.log(`External IP ${ip}`);
  console.log(`Current Route53 IP ${route53IP}`);

  if (ip !== route53IP) {
    console.log("Updating Route53 record");
    await updateRecord(ip);
    console.log("Route53 record updated");
  } else {
    console.log("IP addresses match, no update required");
  }
}

const loop = (): void => {
  checkForUpdate().catch((error) => console.error(error));
}

if (!hostedZoneId) throw new Error("Environment variable HOSTED_ZONE_ID not set")
if (!updateInterval) throw new Error("Environment variable UPDATE_INTERVAL not set")
if (!domainName) throw new Error("Environment variable DOMAIN_NAME not set");

console.log("Starting Route53 Updater");
setInterval(() => loop(), updateInterval);