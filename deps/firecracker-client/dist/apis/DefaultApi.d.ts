/**
 * Firecracker API
 * RESTful public-facing API. The API is accessible through HTTP calls on specific URLs carrying JSON modeled data. The transport medium is a Unix Domain Socket.
 *
 * The version of the OpenAPI document: 1.1.2
 * Contact: compute-capsule@amazon.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import * as runtime from '../runtime';
import type { Balloon, BalloonStats, BalloonStatsUpdate, BalloonUpdate, BootSource, Drive, FirecrackerVersion, FullVmConfiguration, InstanceActionInfo, InstanceInfo, Logger, MachineConfiguration, Metrics, MmdsConfig, NetworkInterface, PartialDrive, PartialNetworkInterface, SnapshotCreateParams, SnapshotLoadParams, Vm, Vsock } from '../models';
export interface CreateSnapshotRequest {
    body: SnapshotCreateParams;
}
export interface CreateSyncActionRequest {
    info: InstanceActionInfo;
}
export interface LoadSnapshotRequest {
    body: SnapshotLoadParams;
}
export interface PatchBalloonRequest {
    body: BalloonUpdate;
}
export interface PatchBalloonStatsIntervalRequest {
    body: BalloonStatsUpdate;
}
export interface PatchGuestDriveByIDRequest {
    driveId: string;
    body: PartialDrive;
}
export interface PatchGuestNetworkInterfaceByIDRequest {
    ifaceId: string;
    body: PartialNetworkInterface;
}
export interface PatchMachineConfigurationRequest {
    body?: MachineConfiguration;
}
export interface PatchMmdsRequest {
    body?: object;
}
export interface PatchVmRequest {
    body: Vm;
}
export interface PutBalloonRequest {
    body: Balloon;
}
export interface PutGuestBootSourceRequest {
    body: BootSource;
}
export interface PutGuestDriveByIDRequest {
    driveId: string;
    body: Drive;
}
export interface PutGuestNetworkInterfaceByIDRequest {
    ifaceId: string;
    body: NetworkInterface;
}
export interface PutGuestVsockRequest {
    body: Vsock;
}
export interface PutLoggerRequest {
    body: Logger;
}
export interface PutMachineConfigurationRequest {
    body?: MachineConfiguration;
}
export interface PutMetricsRequest {
    body: Metrics;
}
export interface PutMmdsRequest {
    body?: object;
}
export interface PutMmdsConfigRequest {
    body: MmdsConfig;
}
/**
 *
 */
export declare class DefaultApi extends runtime.BaseAPI {
    /**
     * Creates a snapshot of the microVM state. The microVM should be in the `Paused` state.
     * Creates a full or diff snapshot. Post-boot only.
     */
    createSnapshotRaw(requestParameters: CreateSnapshotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates a snapshot of the microVM state. The microVM should be in the `Paused` state.
     * Creates a full or diff snapshot. Post-boot only.
     */
    createSnapshot(requestParameters: CreateSnapshotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates a synchronous action.
     */
    createSyncActionRaw(requestParameters: CreateSyncActionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates a synchronous action.
     */
    createSyncAction(requestParameters: CreateSyncActionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Returns the current balloon device configuration.
     */
    describeBalloonConfigRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Balloon>>;
    /**
     * Returns the current balloon device configuration.
     */
    describeBalloonConfig(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Balloon>;
    /**
     * Returns the latest balloon device statistics, only if enabled pre-boot.
     */
    describeBalloonStatsRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<BalloonStats>>;
    /**
     * Returns the latest balloon device statistics, only if enabled pre-boot.
     */
    describeBalloonStats(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<BalloonStats>;
    /**
     * Returns general information about an instance.
     */
    describeInstanceRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<InstanceInfo>>;
    /**
     * Returns general information about an instance.
     */
    describeInstance(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<InstanceInfo>;
    /**
     * Gets configuration for all VM resources. If the VM is restored from a snapshot, the boot-source, machine-config.smt and machine-config.cpu_template will be empty.
     * Gets the full VM configuration.
     */
    getExportVmConfigRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FullVmConfiguration>>;
    /**
     * Gets configuration for all VM resources. If the VM is restored from a snapshot, the boot-source, machine-config.smt and machine-config.cpu_template will be empty.
     * Gets the full VM configuration.
     */
    getExportVmConfig(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FullVmConfiguration>;
    /**
     * Gets the Firecracker version.
     */
    getFirecrackerVersionRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FirecrackerVersion>>;
    /**
     * Gets the Firecracker version.
     */
    getFirecrackerVersion(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FirecrackerVersion>;
    /**
     * Gets the machine configuration of the VM. When called before the PUT operation, it will return the default values for the vCPU count (=1), memory size (=128 MiB). By default SMT is disabled and there is no CPU Template.
     * Gets the machine configuration of the VM.
     */
    getMachineConfigurationRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<MachineConfiguration>>;
    /**
     * Gets the machine configuration of the VM. When called before the PUT operation, it will return the default values for the vCPU count (=1), memory size (=128 MiB). By default SMT is disabled and there is no CPU Template.
     * Gets the machine configuration of the VM.
     */
    getMachineConfiguration(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<MachineConfiguration>;
    /**
     * Get the MMDS data store.
     */
    getMmdsRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>>;
    /**
     * Get the MMDS data store.
     */
    getMmds(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object>;
    /**
     * Loads the microVM state from a snapshot. Only accepted on a fresh Firecracker process (before configuring any resource other than the Logger and Metrics).
     * Loads a snapshot. Pre-boot only.
     */
    loadSnapshotRaw(requestParameters: LoadSnapshotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Loads the microVM state from a snapshot. Only accepted on a fresh Firecracker process (before configuring any resource other than the Logger and Metrics).
     * Loads a snapshot. Pre-boot only.
     */
    loadSnapshot(requestParameters: LoadSnapshotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates an existing balloon device, before or after machine startup. Will fail if update is not possible.
     * Updates a balloon device.
     */
    patchBalloonRaw(requestParameters: PatchBalloonRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates an existing balloon device, before or after machine startup. Will fail if update is not possible.
     * Updates a balloon device.
     */
    patchBalloon(requestParameters: PatchBalloonRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates an existing balloon device statistics interval, before or after machine startup. Will fail if update is not possible.
     * Updates a balloon device statistics polling interval.
     */
    patchBalloonStatsIntervalRaw(requestParameters: PatchBalloonStatsIntervalRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates an existing balloon device statistics interval, before or after machine startup. Will fail if update is not possible.
     * Updates a balloon device statistics polling interval.
     */
    patchBalloonStatsInterval(requestParameters: PatchBalloonStatsIntervalRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates the properties of the drive with the ID specified by drive_id path parameter. Will fail if update is not possible.
     * Updates the properties of a drive. Post-boot only.
     */
    patchGuestDriveByIDRaw(requestParameters: PatchGuestDriveByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates the properties of the drive with the ID specified by drive_id path parameter. Will fail if update is not possible.
     * Updates the properties of a drive. Post-boot only.
     */
    patchGuestDriveByID(requestParameters: PatchGuestDriveByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates the rate limiters applied to a network interface.
     * Updates the rate limiters applied to a network interface. Post-boot only.
     */
    patchGuestNetworkInterfaceByIDRaw(requestParameters: PatchGuestNetworkInterfaceByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates the rate limiters applied to a network interface.
     * Updates the rate limiters applied to a network interface. Post-boot only.
     */
    patchGuestNetworkInterfaceByID(requestParameters: PatchGuestNetworkInterfaceByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Partially updates the Virtual Machine Configuration with the specified input. If any of the parameters has an incorrect value, the whole update fails.
     * Partially updates the Machine Configuration of the VM. Pre-boot only.
     */
    patchMachineConfigurationRaw(requestParameters: PatchMachineConfigurationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Partially updates the Virtual Machine Configuration with the specified input. If any of the parameters has an incorrect value, the whole update fails.
     * Partially updates the Machine Configuration of the VM. Pre-boot only.
     */
    patchMachineConfiguration(requestParameters?: PatchMachineConfigurationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates the MMDS data store.
     */
    patchMmdsRaw(requestParameters: PatchMmdsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates the MMDS data store.
     */
    patchMmds(requestParameters?: PatchMmdsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Sets the desired state (Paused or Resumed) for the microVM.
     * Updates the microVM state.
     */
    patchVmRaw(requestParameters: PatchVmRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Sets the desired state (Paused or Resumed) for the microVM.
     * Updates the microVM state.
     */
    patchVm(requestParameters: PatchVmRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates a new balloon device if one does not already exist, otherwise updates it, before machine startup. This will fail after machine startup. Will fail if update is not possible.
     * Creates or updates a balloon device.
     */
    putBalloonRaw(requestParameters: PutBalloonRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates a new balloon device if one does not already exist, otherwise updates it, before machine startup. This will fail after machine startup. Will fail if update is not possible.
     * Creates or updates a balloon device.
     */
    putBalloon(requestParameters: PutBalloonRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates new boot source if one does not already exist, otherwise updates it. Will fail if update is not possible.
     * Creates or updates the boot source. Pre-boot only.
     */
    putGuestBootSourceRaw(requestParameters: PutGuestBootSourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates new boot source if one does not already exist, otherwise updates it. Will fail if update is not possible.
     * Creates or updates the boot source. Pre-boot only.
     */
    putGuestBootSource(requestParameters: PutGuestBootSourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates new drive with ID specified by drive_id path parameter. If a drive with the specified ID already exists, updates its state based on new input. Will fail if update is not possible.
     * Creates or updates a drive. Pre-boot only.
     */
    putGuestDriveByIDRaw(requestParameters: PutGuestDriveByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates new drive with ID specified by drive_id path parameter. If a drive with the specified ID already exists, updates its state based on new input. Will fail if update is not possible.
     * Creates or updates a drive. Pre-boot only.
     */
    putGuestDriveByID(requestParameters: PutGuestDriveByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates new network interface with ID specified by iface_id path parameter.
     * Creates a network interface. Pre-boot only.
     */
    putGuestNetworkInterfaceByIDRaw(requestParameters: PutGuestNetworkInterfaceByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates new network interface with ID specified by iface_id path parameter.
     * Creates a network interface. Pre-boot only.
     */
    putGuestNetworkInterfaceByID(requestParameters: PutGuestNetworkInterfaceByIDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * The first call creates the device with the configuration specified in body. Subsequent calls will update the device configuration. May fail if update is not possible.
     * Creates/updates a vsock device. Pre-boot only.
     */
    putGuestVsockRaw(requestParameters: PutGuestVsockRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * The first call creates the device with the configuration specified in body. Subsequent calls will update the device configuration. May fail if update is not possible.
     * Creates/updates a vsock device. Pre-boot only.
     */
    putGuestVsock(requestParameters: PutGuestVsockRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Initializes the logger by specifying a named pipe or a file for the logs output.
     */
    putLoggerRaw(requestParameters: PutLoggerRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Initializes the logger by specifying a named pipe or a file for the logs output.
     */
    putLogger(requestParameters: PutLoggerRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Updates the Virtual Machine Configuration with the specified input. Firecracker starts with default values for vCPU count (=1) and memory size (=128 MiB). The vCPU count is restricted to the [1, 32] range. With SMT enabled, the vCPU count is required to be either 1 or an even number in the range. otherwise there are no restrictions regarding the vCPU count. If any of the parameters has an incorrect value, the whole update fails. All parameters that are optional and are not specified are set to their default values (smt = false, track_dirty_pages = false, cpu_template = None).
     * Updates the Machine Configuration of the VM. Pre-boot only.
     */
    putMachineConfigurationRaw(requestParameters: PutMachineConfigurationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Updates the Virtual Machine Configuration with the specified input. Firecracker starts with default values for vCPU count (=1) and memory size (=128 MiB). The vCPU count is restricted to the [1, 32] range. With SMT enabled, the vCPU count is required to be either 1 or an even number in the range. otherwise there are no restrictions regarding the vCPU count. If any of the parameters has an incorrect value, the whole update fails. All parameters that are optional and are not specified are set to their default values (smt = false, track_dirty_pages = false, cpu_template = None).
     * Updates the Machine Configuration of the VM. Pre-boot only.
     */
    putMachineConfiguration(requestParameters?: PutMachineConfigurationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Initializes the metrics system by specifying a named pipe or a file for the metrics output.
     */
    putMetricsRaw(requestParameters: PutMetricsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Initializes the metrics system by specifying a named pipe or a file for the metrics output.
     */
    putMetrics(requestParameters: PutMetricsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Creates a MMDS (Microvm Metadata Service) data store.
     */
    putMmdsRaw(requestParameters: PutMmdsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Creates a MMDS (Microvm Metadata Service) data store.
     */
    putMmds(requestParameters?: PutMmdsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    /**
     * Configures MMDS version, IPv4 address used by the MMDS network stack and interfaces that allow MMDS requests.
     * Set MMDS configuration. Pre-boot only.
     */
    putMmdsConfigRaw(requestParameters: PutMmdsConfigRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    /**
     * Configures MMDS version, IPv4 address used by the MMDS network stack and interfaces that allow MMDS requests.
     * Set MMDS configuration. Pre-boot only.
     */
    putMmdsConfig(requestParameters: PutMmdsConfigRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
}