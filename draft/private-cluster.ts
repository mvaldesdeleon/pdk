import * as pdk from "./pdk";
import * as cluster from "./cluster";

export interface PrivateClusterProps extends cluster.ClusterProps {
    vpcEndpointCount: number,
    availabilityZones: number,
    estimatedDailyVPCEndpointTraffic: number // Gb
}

export class PrivateCluster extends cluster.Cluster {
    constructor(scope: pdk.Construct, id: string, props: PrivateClusterProps) {
        super(scope, id, props);

        new VPCEndpoints(this, 'VPC Endpoints', {
            vpcEndpointCount: props.vpcEndpointCount,
            availabilityZones: props.availabilityZones,
            dailyTraffic: props.estimatedDailyVPCEndpointTraffic
        });
    }
}

interface VPCEndpointsProps {
    vpcEndpointCount: number,
    availabilityZones: number,
    dailyTraffic: number
}

class VPCEndpoints extends pdk.Construct {
    constructor(scope: pdk.Construct, id: string, props: VPCEndpointsProps) {
        super(scope, id);

        new pdk.VPCE.Endpoint(this, `${id} - VPCE Endpoints`, {
            count: props.vpcEndpointCount,
            availabilityZones: props.availabilityZones
        });

        new pdk.VPCE.DataProcessing(this, `${id} - VPCE Data Processing`, {
            processedBytes: props.dailyTraffic * pdk.DAYS_PER_MONTH
        });
    }
}