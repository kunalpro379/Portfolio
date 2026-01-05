# How Traffic Really Flows Inside an AWS VPC

![VPC Traffic Flow Diagram](https://res.cloudinary.com/dtb3kkucq/image/upload/v1767459688/VPC_lxvrs8.webp)

When you deploy something on AWS, you’re not “putting it on the internet”. You’re placing it inside a locked private network and then carefully opening doors. That private network is your VPC.

## VPC = Your Private Network Boundary

A VPC is like your own private LAN inside AWS.  
Nothing comes in, nothing goes out unless you explicitly allow it.

Every EC2, container, ALB all of them live inside this boundary.

## Subnets: Just IP Partitions, Not Security

A subnet is just a range of IP addresses. What actually makes a subnet public or private is routing. Security comes later.

- Public subnet :- Route table has a path to the Internet Gateway  
- Private subnet :- No direct path to Internet Gateway  

## Internet Gateway: The Only Way In or Out

The Internet Gateway (IGW) is the only component that talks to the public internet. IGW does nothing by itself, Subnet must point traffic to it, Security rules must allow traffic.

You don’t expose your servers directly. Instead ALB sits in public subnet, EC2 / containers sit in private subnet.

Therefore Flow: Internet → ALB → Target Group → Private EC2 / Container

This way, your backend never touches the internet. Only ALB is exposed. Scaling & health checks are handled automatically.

## Security Groups: Instance-Level Protection

Security Groups work at the instance or interface level, which means they are directly attached to EC2 instances, ENIs, and Load Balancers, not to subnets.

They are:
- Stateful  
- “Allow-only” firewalls  

What that means, if inbound traffic is allowed, response traffic is automatically allowed. You don’t write return rules.

Example:  
ALB → EC2 on port 3000 and allow inbound from ALB Security Group.

Once that is done, the EC2 instance can send responses back to the ALB without any additional rules, because the Security Group automatically tracks the connection state.

## NACL: Subnet-Level Hard Rules

NACL (Network ACL) works at the subnet level and acts like a hard network firewall for everything inside that subnet. It is stateless, which means it does not remember traffic, so you must explicitly allow both inbound and outbound traffic for a connection to work.

NACLs also support explicit allow and deny rules, and because rules are evaluated in order, one wrong or missing rule can completely break traffic. This makes NACLs powerful but dangerous if misconfigured.

In real systems, NACLs are mainly used for blocking specific IP ranges, enforcing organization-wide network policies, and adding an extra defense-in-depth layer below Security Groups, so even if instance-level rules are misconfigured, the network still remains protected.

## What If My Container Needs Internet?

When your container is running inside a private subnet, it is intentionally isolated from the internet. This means it cannot directly make outbound internet calls, because private subnets do not have a route to the Internet Gateway.

This design protects your backend workloads from being exposed accidentally.

However, in real applications, containers often need internet access — for example, to call external APIs, pull Docker images, fetch secrets, or install updates.

To enable this safely, AWS uses a NAT Gateway, which is placed in a public subnet.

The private subnet’s route table is then configured so that outbound traffic is sent to the NAT Gateway, which in turn forwards it to the Internet Gateway.

From the container’s perspective, it can now reach the internet, but the key detail is that the internet can never initiate a connection back to the container.

All traffic is outbound-only and response-based.

This setup gives you the best of both worlds: your containers remain completely private and unreachable from outside, while still having controlled internet access when they need it, making it a secure and production-safe architecture.

## In Conclusion

A request from the internet enters the VPC through the Internet Gateway, reaches the Application Load Balancer in a public subnet, and is forwarded to targets running in private subnets.

Security Groups control instance-level access, while NACLs enforce subnet-wide network rules.

Outbound-only internet access for private workloads is handled through a NAT Gateway.

Each layer has a single responsibility, ensuring scalability, isolation.

---

**Thank You!**

Original blog:  
https://medium.com/@kunaldp379/how-traffic-really-flows-inside-an-aws-vpc-2d58c1ee5b9e


