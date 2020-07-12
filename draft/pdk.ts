export const DAYS_PER_MONTH = 30;

export interface ConstructProps {
    count?: number
}

export class Construct {
    constructor(scope: Construct, id: string, props: ConstructProps = {}) {
        props.count = props?.count ?? 1;
    }
}

export module EKS {
    export class ManagedControlPlane extends Construct {
        constructor(scope: Construct, id: string, props?: ConstructProps) {
            super(scope, id, props);
        }
    }
}

export module EC2 {
    export type InstanceType = 'm5.large' | 't3.medium';

    export interface InstanceProps extends ConstructProps {
        type: InstanceType
    }

    export class Instance extends Construct {
        constructor(scope: Construct, id: string, props: InstanceProps) {
            super(scope, id, props);
        }
    }

    export interface IntraRegionDataTransferProps extends ConstructProps {
        processedBytes: number // Gb-month
    }

    export class IntraRegionDataTransfer extends Construct {
        constructor(scope: Construct, id: string, props: IntraRegionDataTransferProps) {
            super(scope, id, props);
        }
    }
}

export module ELB {
    export class ApplicationLoadBalancer extends Construct {
        constructor(scope: Construct, id: string, props?: ConstructProps) {
            super(scope, id, props);
        }
    }

    export interface LoadCapacityUnitProps extends ConstructProps {
        processedBytes?: number, // Gb-Month
        connectionCount?: number, // #-Month
        requestCount?: number, // #-Month
        ruleCount?: number, // #
        sessionLength?: number // Seconds
        units?: number // #-Month
    }

    export class LoadCapacityUnit extends Construct {
        constructor(scope: Construct, id: string, props: LoadCapacityUnitProps) {
            super(scope, id, props);

            const dimensions: number[] = [];
            if (props.processedBytes) {
                dimensions.push(props.processedBytes);
            }
            if (props.connectionCount) {
                dimensions.push(props.connectionCount / (DAYS_PER_MONTH * 24 * 60 * 60 * 25));

                if (props.sessionLength) {
                    dimensions.push(props.connectionCount * props.sessionLength / (DAYS_PER_MONTH * 24 * 60 * 60 * 3000));
                }
            }
            if (props.requestCount && props.ruleCount > 10) {
                dimensions.push(props.requestCount * (props.ruleCount - 10) / (DAYS_PER_MONTH * 24 * 60 * 60 * 1000));
            }

            props.units = props?.units ?? Math.max(...dimensions);
        }
    }
}

export module EBS {
    export type VolumeType = 'io1' | 'gp2' | 'sc1' | 'st1' | 'standard';

    export interface VolumeProps extends ConstructProps {
        type: VolumeType,
        size: number // Gb-month
    }

    export class Volume extends Construct {
        constructor(scope: Construct, id: string, props: VolumeProps) {
            super(scope, id, props);
        }
    }

    export interface SnapshotProps extends ConstructProps {
        size: number // Gb-month
    }

    export class Snapshot extends Construct {
        constructor(scope: Construct, id: string, props: SnapshotProps) {
            super(scope, id, props);
        }
    }
}

export module CW {
    export interface LogIngestionProps extends ConstructProps {
        size: number // Gb-month
    }

    export class LogIngestion extends Construct {
        constructor(scope: Construct, id: string, props: LogIngestionProps) {
            super(scope, id, props);
        }
    }

    export interface LogArchivalProps extends ConstructProps {
        size: number // Gb-month
    }

    export class LogArchival extends Construct {
        constructor(scope: Construct, id: string, props: LogArchivalProps) {
            super(scope, id, props);
        }
    }
}

export module VPCE {
    export interface EndpointProps extends ConstructProps {
        availabilityZones: number
    }

    export class Endpoint extends Construct {
        constructor(scope: Construct, id: string, props: EndpointProps) {
            super(scope, id, props);
        }
    }

    export interface DataProcessingProps extends ConstructProps {
        processedBytes: number // Gb-month
    }

    export class DataProcessing extends Construct {
        constructor(scope: Construct, id: string, props: DataProcessingProps) {
            super(scope, id, props);
        }
    }
}