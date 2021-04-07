---
title: Setting up multiple DNS servers on Ubuntu
slug: setting-up-mulitple-dns-ubuntu
createdAt: "2020-09-29"
keywords: multiple dns,dns,dnsmasq,ubuntu,linux
---

Sometimes, for some reason, we are connected through multiple VPNs that may have different DNS servers to provide domains for all internal VPN stuff, the issue is that `/etc/resolv.conf` accepts only a single server.

The quick solution would be map every resource we need to `/etc/hosts`

E.g.

```plaintext
resource-one.example.com 1.2.3.4
resource-two.example.com 5.6.7.8
```

This works well but is very annoying, because everytime we have a new resource or an IP address changes, we need to update this file.

## The solution

To solve it we can use the `dnsmasq`, it provides us a DNS server and the best is that it comes with NetworkManager in the latest Ubuntu versions!

### Setting NetworkManager to use dnsmasq

Open `/etc/NetworkManager/NetworkManager.conf` and check `dns` property:

```plaintext
[main]
...
dns=dnsmasq
...
```

### Setting /etc/resolv.conf

Now we need to set up the `/etc/resolv.conf` to use `dnsmasq` as a DNS server and protect it from being overwritten by VPN clients.

```bash
$ sudo echo "nameserver 127.0.1.1" > /etc/resolv.conf # set dnsmasq as DNS server
$ sudo chattr +i /etc/resolv.conf # set immutable state to prevent changes to the file
```

**Note:** Unfortunately Cisco AnyConnect just doesn't work if we prevent it from editing that file).

### Setting dnsmasq to use the servers based on domain

Now you add a new file or edit the existing one in `/etc/NetworkManager/dnsmasq.d` with the DNS servers based on domain.

#### Example

- General domains:

```plaintext
server=1.1.1.1
server=1.0.0.1
```

- VPN 1:

```plaintext
server=/vpn.example1.com/1.1.1.1
server=/example1.com/10.10.1.1
```

- VPN 2:

```plaintext
server=/connect.example2.com/1.1.1.1
server=/example2.com/192.100.0.3
```

**Note:** Notice that "hardcoded" VPN domains to 1.1.1.1 (Cloudflare). This is done to be able to connect to the VPN once its address is part of the domains we've set up to internal VPN servers.

So the final config file for it will be:

```plaintext
server=1.1.1.1
server=1.0.0.1
server=/vpn.example1.com/1.1.1.1
server=/example1.com/10.10.1.1
server=/connect.example2.com/1.1.1.1
server=/example2.com/192.100.0.3
```

Now you can connect in both VPN at the same time with no issues!
