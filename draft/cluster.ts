import * as pdk from "./pdk";

export interface ClusterProps {
    workerNodeCount: number,
    workerInstanceType: pdk.EC2.InstanceType,
    workerStorageSize: number, // Gb
    clusterStorageSize: number, // Gb
    clusterStorageBackupFrequency: number, // Days
    clusterStorageBackupRetention: number, // Days
    estimatedDailyInternalTraffic: number, // Gb
    loadBalancerCount: number,
    estimatedDailyExternalTraffic: number, // Gb
    estimatedDailyLogsSize: number, // Gb
    logRetention: number // Months
    availabilityZones?: number
}

export class Cluster extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: ClusterProps) {
        super(scope, id);

        new pdk.EKS.ManagedControlPlane(this, 'EKS Managed Control Plane');

        new InstanceGroup(this, 'Worker Node Group', {
            instanceCount: props.workerNodeCount,
            instanceType: props.workerInstanceType,
            ebsStorageSize: props.workerStorageSize,
            ebsVolumeType: 'gp2'
        });

        new BackedUpEBS(this, 'Cluster Storage', {
            volumeType: 'gp2',
            volumeSize: props.clusterStorageSize,
            snapshotFrequency: props.clusterStorageBackupFrequency,
            snapshotRetention: props.clusterStorageBackupRetention
        });

        new InternalTraffic(this, 'Internal Traffic', {
            dailyTraffic: props.estimatedDailyInternalTraffic,
            availabilityZones: props.availabilityZones
        });

        new LoadBalancers(this, 'Load Balancers', {
            loadBalancerCount: props.loadBalancerCount,
            loadBalancerDailyTraffic: props.estimatedDailyExternalTraffic
        });

        new Logs(this, 'Logs', {
            logSize: props.estimatedDailyLogsSize,
            logFrequency: 1,
            logRetention: props.logRetention * pdk.DAYS_PER_MONTH
        });
    }
}

interface BackedUpEBSProps {
    volumeType: pdk.EBS.VolumeType,
    volumeSize: number, // Gb
    snapshotFrequency: number // Days
    snapshotRetention: number // Days
}

class BackedUpEBS extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: BackedUpEBSProps) {
        super(scope, id);

        if (props.volumeSize > 0) {
            new pdk.EBS.Volume(this, `${id} - EBS Volumes`, {
                type: props.volumeType,
                size: props.volumeSize
            });

            if (props.snapshotRetention > 0) {
                const replicationRatio = props.snapshotRetention / props.snapshotFrequency;
                new pdk.EBS.Snapshot(this, `${id} - EBS Snapshots (${replicationRatio} replication)`, {
                    size: props.volumeSize * replicationRatio
                });
            }
        }
    }
}

interface InstanceGroupProps {
    instanceCount: number,
    instanceType: pdk.EC2.InstanceType,
    ebsStorageSize: number, // Gb
    ebsVolumeType: pdk.EBS.VolumeType
}

class InstanceGroup extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: InstanceGroupProps) {
        super(scope, id);

        new pdk.EC2.Instance(this, `${id} - EC2 Instances`, {
            count: props.instanceCount,
            type: props.instanceType
        });

        if (props.ebsStorageSize > 0) {
            new pdk.EBS.Volume(this, `${id} - EBS Volumes`, {
                count: props.instanceCount,
                type: props.ebsVolumeType,
                size: props.ebsStorageSize
            });
        }
    }
}

interface LogsProps {
    logSize: number, // Gb
    logFrequency: number, // Days
    logRetention: number // Days,
    compressionRatio?: number
}

class Logs extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: LogsProps) {
        super(scope, id);

        props.compressionRatio = props?.compressionRatio ?? 1;

        if (props.logSize > 0) {
            new pdk.CW.LogIngestion(this, `${id} - CW Log Ingestion`, {
                size: props.logSize * pdk.DAYS_PER_MONTH / props.logFrequency
            });

            if (props.logRetention > 0) {
                const replicationRatio = props.logRetention / props.logFrequency;
                new pdk.CW.LogArchival(this, `${id} - CW Log Archival (${replicationRatio} replication, ${props.compressionRatio} compression)`, {
                    size: props.logSize * replicationRatio * props.compressionRatio
                });
            }
        }
    }
}

interface InternalTrafficProps {
    dailyTraffic: number, // Gb
    availabilityZones?: number
}

class InternalTraffic extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: InternalTrafficProps) {
        super(scope, id);

        // Assume the worst case scenario for cross-AZ traffic
        props.availabilityZones = props?.availabilityZones ?? 6;

        if (props.dailyTraffic > 0 && props.availabilityZones > 1) {
            const ratio = (props.availabilityZones - 1) / props.availabilityZones;
            new pdk.EC2.IntraRegionDataTransfer(this, `${id} - EC2 Cross-AZ Traffic (${ratio} ratio)`, {
                count: 2, // We own both the target and source VPCs
                processedBytes: props.dailyTraffic * ratio
            });
        }
    }
}

interface LoadBalancersProps {
    loadBalancerCount: number,
    loadBalancerDailyTraffic: number // Gb
}

class LoadBalancers extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: LoadBalancersProps) {
        super(scope, id);

        if (props.loadBalancerCount > 0) {
            new pdk.ELB.ApplicationLoadBalancer(this, `${id} - ELB Application Load Balancers`, {
                count: props.loadBalancerCount
            });
        }

        if (props.loadBalancerDailyTraffic > 0) {
            new pdk.ELB.LoadCapacityUnit(this, `${id} - ELB Load Capacity Units`, {
                processedBytes: props.loadBalancerDailyTraffic * pdk.DAYS_PER_MONTH
            });
        }
    }
}