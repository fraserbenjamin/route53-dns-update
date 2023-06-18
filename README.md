# Route53 DNS Update

This is a simple script to update a Route53 DNS record with the current public IP address of the machine it is running on.

## Setup

This application is designed to be run with Docker. To build the image, run the following command:

```
docker build -t route53-dns-update .
```

Or pull the image from Docker Hub:

```
docker pull fraserbenjamin/route53-dns-update
```

# Configuration

The application is configured using environment variables. The following variables are required:

- `AWS_ACCESS_KEY_ID` - The AWS access key ID to use for authentication
- `AWS_SECRET_ACCESS_KEY` - The AWS secret access key to use for authentication
- `AWS_HOSTED_ZONE_ID` - The ID of the hosted zone to update e.g. `Z1234567890`
- `AWS_RECORD_SET_NAME` - The name of the record set to update e.g. `home.example.com`
- `UPDATE_INTERVAL` - The interval (in seconds) to wait between updates

# IAM Permissions

The following IAM permissions are required for the application to run:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Route53Update",
            "Effect": "Allow",
            "Action": [
                "route53:ChangeResourceRecordSets",
                "route53:ListResourceRecordSets"
            ],
            "Resource": [
                "arn:aws:route53:::hostedzone/<HOSTED_ZONE_ID>"
            ]
        }
    ]
}
```
