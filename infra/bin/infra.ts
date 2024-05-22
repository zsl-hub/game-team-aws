#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver } from 'aws-cdk-lib/aws-ecs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

const app = new cdk.App();
const infraStack = new InfraStack(app, 'InfraStackBQ', {});
const infraVpc = new Vpc(infraStack, "InfraStackVpc")
const infraCluster = new Cluster(infraStack, 'InfraCluster', { vpc: infraVpc });

const fargate1TaskDef = new FargateTaskDefinition(infraStack, "InfraFargate1", {
  cpu: 1024,
  memoryLimitMiB: 3072 
})

const fargate2TaskDef = new FargateTaskDefinition(infraStack, "InfraFargate2", {
  cpu: 1024,
  memoryLimitMiB: 3072 
});

const battleshiprepo = Repository.fromRepositoryArn(infraStack,"InfraBattleShipRepo", "arn:aws:ecr:eu-north-1:028156156088:repository/battleship-game")

const infraSecurityGroup = new SecurityGroup(infraStack, "blablabla", {
  vpc: infraVpc,
  allowAllOutbound: true
})

infraSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.HTTP)
infraSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(5173)); // it may not be working because of it
infraSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(3000)); // it may not be working because of it

fargate1TaskDef.addContainer(
  "InfraFargate1Container",
  {
    image: ContainerImage.fromEcrRepository(battleshiprepo, "frontend-0a4ff5b28411d9d6d6c8a33744e3907f1cc27a89"),
    portMappings: [{hostPort: 5173, containerPort: 5173}],
    logging: LogDriver.awsLogs({
      streamPrefix: "frontend"
    })
  }
)

fargate2TaskDef.addContainer("InfraFargate2Container", {
  image: ContainerImage.fromEcrRepository(battleshiprepo, "backend-37b94b6da7e239d9911b0591fe16a62be6bc0282"),
  portMappings: [{hostPort: 3000, containerPort: 3000}],
  logging: LogDriver.awsLogs({
    streamPrefix: "backend"
  })
});

//cloudmap

const fargateService = new FargateService(infraStack, "InfraFargateService", {
  taskDefinition: fargate1TaskDef,
  cluster: infraCluster,
  securityGroups: [infraSecurityGroup],
  assignPublicIp: true
})

const fargateService2 = new FargateService(infraStack, "InfraFargateService2", {
  taskDefinition: fargate2TaskDef,
  cluster: infraCluster,
  securityGroups: [infraSecurityGroup],
  assignPublicIp: true
});

const alb = new ApplicationLoadBalancer(infraStack, 'InfraStackAlb', {
  vpc: infraVpc,
  internetFacing: true
})

const alb2 = new ApplicationLoadBalancer(infraStack, 'InfraStackAlb2', {
  vpc: infraVpc,
  internetFacing: true
});

const frontendTargetGroup = new ApplicationTargetGroup(infraStack, "FrontendTargetGroup", {
  port: 5173,
  targetType: TargetType.IP,
  protocol: ApplicationProtocol.HTTP,
  vpc: infraVpc,
  healthCheck: {
    path: "/views/game/index.html",
    healthyHttpCodes: "200-499"
  }
})

const backendTargetGroup = new ApplicationTargetGroup(infraStack, "BackendTargetGroup", {
  port: 3000,
  targetType: TargetType.IP,
  protocol: ApplicationProtocol.HTTP,
  vpc: infraVpc,
  healthCheck: {
    path: "/lobby/orangutan",
    healthyHttpCodes: "200-499"
  }
});

frontendTargetGroup.addTarget(fargateService)
backendTargetGroup.addTarget(fargateService2);

const listener = alb.addListener("alb-listener", {
  open: true,
  port: 80
})

const listener2 = alb2.addListener("AlbListener2", {
  open: true,
  port: 80
});

listener.addTargetGroups("frontend-target", {
  targetGroups: [frontendTargetGroup]
})

listener2.addTargetGroups("backend-target", {
  targetGroups: [backendTargetGroup]
});