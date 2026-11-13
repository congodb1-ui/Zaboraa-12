# Template State Matrix Summary

## Table 1: Direct WizardState Output Matrix

| template | sourcePlatform | targetPlatform | targetNodeSku | targetNodeCount | storage provider | decoupledStorageTB | landingZonePattern | firewall | interconnect type | migration tool | DR engine | rpoMinutes | rtoMinutes | drStrategy | activeTemplate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| vmware-to-avs | vmware | avs-gen2 | AV64 | 4 | Azure NetApp Files (ANF NFS Datastore) | 120 | Azure Virtual WAN Hub-and-Spoke | Palo Alto Networks VM-Series | Azure ExpressRoute FastPath (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 5 | 20 | Pilot Light (3-Node Minimum) | avs |
| vmware-to-nc2 | vmware | nc2-azure | AN36P | 4 | Native Nutanix Distributed Storage Fabric (DSF) | 80 | Azure Virtual WAN Hub-and-Spoke | Azure Firewall Premium / Native | Azure ExpressRoute Dedicated Circuit (10 Gbps) | Nutanix Move | Nutanix Protection Domains (NearSync & Metro Availability) | 15 | 60 | Pilot Light (3-Node Minimum) | vmware-to-nc2 |
| nutanix-to-nc2 | nutanix | nc2-azure | AN36P | 4 | Native Nutanix Distributed Storage Fabric (DSF) | 80 | Azure Virtual WAN Hub-and-Spoke | Azure Firewall Premium / Native | Azure ExpressRoute Dedicated Circuit (10 Gbps) | Nutanix Move | Nutanix Protection Domains (NearSync & Metro Availability) | 15 | 60 | Pilot Light (3-Node Minimum) | nutanix-to-nc2 |
| vmware-to-gcve | vmware | gcve | ve1-standard-72 | 4 | Google Cloud NetApp Volumes (GCNV NFS Datastore) | 100 | Google Cloud Shared VPC + Cloud NCC | Palo Alto Networks VM-Series | Google Cloud Dedicated Interconnect (10 Gbps) | VMware HCX Enterprise | Zerto Continuous Data Protection (CDP) | 15 | 30 | Pilot Light (3-Node Minimum) | gcve |
| vmware-to-vmc | vmware | vmc-aws | i4i.metal | 3 | Amazon FSx for NetApp ONTAP (NFS Datastore) | 150 | AWS Transit Gateway (TGW) Hub | Fortinet FortiGate-VM | AWS Direct Connect (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 15 | 30 | Pilot Light (3-Node Minimum) | vmc-aws |
| custom-path | vmware | avs-gen2 | AV64 | 4 | Azure NetApp Files (ANF NFS Datastore) | 80 | Azure Virtual WAN Hub-and-Spoke | Palo Alto Networks VM-Series | Azure ExpressRoute FastPath (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 15 | 45 | Warm Standby (Full Cluster) | multi-cloud |

## Table 2: Target[0] and Source[0] Derived Output Matrix

| template | source[0].platform | target[0].platform | target[0].nodeSku | target[0].nodeCount | target[0].storage provider | target[0].decoupledStorageTB | target[0].interconnectCircuitType | target[0].migrationTool | DR target drEngine | DR target drRpoMinutes | DR target drRtoMinutes | DR target drStrategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| vmware-to-avs | vmware-onprem | avs-gen2 | AV64 | 4 | Azure NetApp Files (ANF NFS Datastore) | 120 | Azure ExpressRoute FastPath (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 5 | 20 | Pilot Light (3-Node Minimum) |
| vmware-to-nc2 | vmware-onprem | nc2-azure | AN36P | 4 | Native Nutanix Distributed Storage Fabric (DSF) | 80 | Azure ExpressRoute Dedicated Circuit (10 Gbps) | Nutanix Move | Nutanix Protection Domains (NearSync & Metro Availability) | 15 | 60 | Pilot Light (3-Node Minimum) |
| nutanix-to-nc2 | nutanix-onprem | nc2-azure | AN36P | 4 | Native Nutanix Distributed Storage Fabric (DSF) | 80 | Azure ExpressRoute Dedicated Circuit (10 Gbps) | Nutanix Move | Nutanix Protection Domains (NearSync & Metro Availability) | 15 | 60 | Pilot Light (3-Node Minimum) |
| vmware-to-gcve | vmware-onprem | gcve | ve1-standard-72 | 4 | Google Cloud NetApp Volumes (GCNV NFS Datastore) | 100 | Google Cloud Dedicated Interconnect (10 Gbps) | VMware HCX Enterprise | Zerto Continuous Data Protection (CDP) | 15 | 30 | Pilot Light (3-Node Minimum) |
| vmware-to-vmc | vmware-onprem | vmc-aws | i4i.metal | 3 | Amazon FSx for NetApp ONTAP (NFS Datastore) | 150 | AWS Direct Connect (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 15 | 30 | Pilot Light (3-Node Minimum) |
| custom-path | vmware-onprem | avs-gen2 | AV64 | 4 | Azure NetApp Files (ANF NFS Datastore) | 80 | Azure ExpressRoute FastPath (10 Gbps) | VMware HCX Enterprise | VMware Site Recovery Manager (SRM) + vSphere Replication | 15 | 45 | Warm Standby (Full Cluster) |
