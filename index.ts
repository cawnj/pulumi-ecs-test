import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const cpu = config.getNumber("cpu") || 512;
const memory = config.getNumber("memory") || 128;

const repository = new awsx.ecr.Repository("my-repo");

const image = new awsx.ecr.Image("my-image", {
    repositoryUrl: repository.url,
    path: "./app",
});

const cluster = new aws.ecs.Cluster("my-cluster");

const loadBalancer = new awsx.lb.ApplicationLoadBalancer("my-lb");

const service = new awsx.ecs.FargateService("my-service", {
    cluster: cluster.arn,
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            image: image.imageUri,
            cpu: cpu,
            memory: memory,
            essential: true,
            portMappings: [{
                targetGroup: loadBalancer.defaultTargetGroup,
            }],
        },
    },
});

export const url = loadBalancer.loadBalancer.dnsName;
