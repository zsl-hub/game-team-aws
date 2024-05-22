#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver } from 'aws-cdk-lib/aws-ecs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

const app = new cdk.App();
const infraStack = new InfraStack(app, 'InfraStack69', {});
const infraVpc = new Vpc(infraStack, "InfraStackVpc")
const infraCluster = new Cluster(infraStack, 'InfraCluster', { vpc: infraVpc });

const fargate1TaskDef = new FargateTaskDefinition(infraStack, "InfraFargate1", {
  cpu: 1024,
  memoryLimitMiB: 3072 
})

const battleshiprepo = Repository.fromRepositoryArn(infraStack,"InfraBattleShipRepo", "arn:aws:ecr:eu-north-1:028156156088:repository/battleship-game")

const infraSecurityGroup = new SecurityGroup(infraStack, "blablabla", {
  vpc: infraVpc,
  allowAllOutbound: true
})

infraSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.HTTP)

fargate1TaskDef.addContainer(
  "InfraFargate1Container",
  {
    image: ContainerImage.fromEcrRepository(battleshiprepo, "frontend-cae21150de85493f282abdf0adbc9a1bc4b5d62c"),
    portMappings: [{hostPort: 5173, containerPort: 5173}],
    logging: LogDriver.awsLogs({
      streamPrefix: "sss"
    })
  }
)

//cloudmap

const fargateService = new FargateService(infraStack, "InfraFargateService", {
  taskDefinition: fargate1TaskDef,
  cluster: infraCluster,
  securityGroups: [infraSecurityGroup],
  assignPublicIp: true
})


const alb = new ApplicationLoadBalancer(infraStack, 'InfraStackAlb', {
  vpc: infraVpc
})

const applicationtargetgroup = new ApplicationTargetGroup(infraStack, "infraStackTargetGroup", {
  port: 5173,
  targetType: TargetType.IP,
  protocol: ApplicationProtocol.HTTP,
  vpc: infraVpc,
  healthCheck: {
    path: "/views/game/index.html",
    healthyHttpCodes: "200-499"
  }
})

applicationtargetgroup.addTarget(fargateService)

const listener = alb.addListener("alb-listener", {
  open: true,
  port: 80
})

listener.addTargetGroups("bbaldfbaf", {
  targetGroups: [applicationtargetgroup]
})