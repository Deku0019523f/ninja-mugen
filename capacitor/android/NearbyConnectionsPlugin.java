package com.ninjamugen.app;

import android.Manifest;
import android.os.Build;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.connection.AdvertisingOptions;
import com.google.android.gms.nearby.connection.BandwidthInfo;
import com.google.android.gms.nearby.connection.ConnectionInfo;
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback;
import com.google.android.gms.nearby.connection.ConnectionResolution;
import com.google.android.gms.nearby.connection.ConnectionsClient;
import com.google.android.gms.nearby.connection.ConnectionsStatusCodes;
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo;
import com.google.android.gms.nearby.connection.DiscoveryOptions;
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback;
import com.google.android.gms.nearby.connection.Payload;
import com.google.android.gms.nearby.connection.PayloadCallback;
import com.google.android.gms.nearby.connection.PayloadTransferUpdate;
import com.google.android.gms.nearby.connection.Strategy;

import java.util.ArrayList;
import java.util.List;

/**
 * Pont Capacitor ↔ Google Nearby Connections (play-services-nearby).
 * Nearby choisit seul la liaison : BLE / Bluetooth classique pour la découverte, puis montée en débit vers
 * le Wi-Fi LAN ou un point d'accès Wi-Fi Direct. Aucune configuration manuelle de liaison n'est possible côté API.
 *
 * Méthodes JS : ensurePermissions, startAdvertising, stopAdvertising, startDiscovery, stopDiscovery,
 *               requestConnection, acceptConnection, rejectConnection, sendPayload, disconnect, stopAll
 * Événements  : endpointFound, endpointLost, connectionInitiated, connectionResult, bandwidth, disconnected, payload
 */
@CapacitorPlugin(
    name = "NearbyConnections",
    permissions = {
        @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(alias = "bluetooth12", strings = {
            Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE, Manifest.permission.BLUETOOTH_CONNECT }),
        @Permission(alias = "wifi13", strings = { Manifest.permission.NEARBY_WIFI_DEVICES })
    }
)
public class NearbyConnectionsPlugin extends Plugin {

    private ConnectionsClient client;

    private ConnectionsClient client() {
        if (client == null) client = Nearby.getConnectionsClient(getContext());
        return client;
    }

    private Strategy strategy(PluginCall call) {
        return "cluster".equals(call.getString("strategy", "point")) ? Strategy.P2P_CLUSTER : Strategy.P2P_POINT_TO_POINT;
    }

    // ------------------------------------------------------------------ permissions (selon la version d'Android)
    private String[] neededAliases() {
        int sdk = Build.VERSION.SDK_INT;
        List<String> a = new ArrayList<>();
        if (sdk <= 32) a.add("location");          // Android ≤ 12L : localisation exigée pour la découverte
        if (sdk >= 31) a.add("bluetooth12");       // Android 12+ : BLUETOOTH_SCAN / ADVERTISE / CONNECT
        if (sdk >= 33) a.add("wifi13");            // Android 13+ : NEARBY_WIFI_DEVICES
        return a.toArray(new String[0]);
    }

    private boolean hasAll() {
        for (String a : neededAliases()) if (getPermissionState(a) != PermissionState.GRANTED) return false;
        return true;
    }

    @PluginMethod
    public void ensurePermissions(PluginCall call) {
        if (hasAll()) { granted(call); return; }
        requestPermissionForAliases(neededAliases(), call, "permissionsCallback");
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) { granted(call); }

    private void granted(PluginCall call) {
        JSObject r = new JSObject();
        r.put("granted", hasAll());
        call.resolve(r);
    }

    // ------------------------------------------------------------------ rappels Nearby
    private final ConnectionLifecycleCallback connCb = new ConnectionLifecycleCallback() {
        @Override public void onConnectionInitiated(@NonNull String id, @NonNull ConnectionInfo info) {
            JSObject o = new JSObject();
            o.put("endpointId", id); o.put("endpointName", info.getEndpointName());
            o.put("digits", info.getAuthenticationDigits()); o.put("incoming", info.isIncomingConnection());
            notifyListeners("connectionInitiated", o);
        }
        @Override public void onConnectionResult(@NonNull String id, @NonNull ConnectionResolution r) {
            int code = r.getStatus().getStatusCode();
            JSObject o = new JSObject();
            o.put("endpointId", id);
            o.put("status", code == ConnectionsStatusCodes.STATUS_OK ? "connected" : code == ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED ? "rejected" : "error");
            notifyListeners("connectionResult", o);
        }
        @Override public void onDisconnected(@NonNull String id) {
            JSObject o = new JSObject(); o.put("endpointId", id);
            notifyListeners("disconnected", o);
        }
        @Override public void onBandwidthChanged(@NonNull String id, @NonNull BandwidthInfo info) {
            int q = info.getQuality();
            JSObject o = new JSObject();
            o.put("endpointId", id);
            o.put("quality", q == BandwidthInfo.Quality.HIGH ? "high" : q == BandwidthInfo.Quality.MEDIUM ? "medium" : q == BandwidthInfo.Quality.LOW ? "low" : "unknown");
            notifyListeners("bandwidth", o);
        }
    };

    private final EndpointDiscoveryCallback discCb = new EndpointDiscoveryCallback() {
        @Override public void onEndpointFound(@NonNull String id, @NonNull DiscoveredEndpointInfo info) {
            JSObject o = new JSObject(); o.put("endpointId", id); o.put("endpointName", info.getEndpointName());
            notifyListeners("endpointFound", o);
        }
        @Override public void onEndpointLost(@NonNull String id) {
            JSObject o = new JSObject(); o.put("endpointId", id);
            notifyListeners("endpointLost", o);
        }
    };

    private final PayloadCallback payloadCb = new PayloadCallback() {
        @Override public void onPayloadReceived(@NonNull String id, @NonNull Payload p) {
            if (p.getType() != Payload.Type.BYTES || p.asBytes() == null) return;
            JSObject o = new JSObject(); o.put("endpointId", id); o.put("data", Base64.encodeToString(p.asBytes(), Base64.NO_WRAP));
            notifyListeners("payload", o);
        }
        @Override public void onPayloadTransferUpdate(@NonNull String id, @NonNull PayloadTransferUpdate u) { /* octets seuls : rien à suivre */ }
    };

    // ------------------------------------------------------------------ méthodes JS
    @PluginMethod
    public void startAdvertising(PluginCall call) {
        String name = call.getString("name", "NINJA"), service = call.getString("serviceId", "com.ninjamugen.nearby");
        AdvertisingOptions opts = new AdvertisingOptions.Builder().setStrategy(strategy(call)).build();
        client().startAdvertising(name, service, connCb, opts)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject("startAdvertising : " + e.getMessage()));
    }

    @PluginMethod
    public void stopAdvertising(PluginCall call) { client().stopAdvertising(); call.resolve(); }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        String service = call.getString("serviceId", "com.ninjamugen.nearby");
        DiscoveryOptions opts = new DiscoveryOptions.Builder().setStrategy(strategy(call)).build();
        client().startDiscovery(service, discCb, opts)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject("startDiscovery : " + e.getMessage()));
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) { client().stopDiscovery(); call.resolve(); }

    @PluginMethod
    public void requestConnection(PluginCall call) {
        String id = call.getString("endpointId"), name = call.getString("name", "NINJA");
        if (id == null) { call.reject("endpointId manquant"); return; }
        client().requestConnection(name, id, connCb)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject("requestConnection : " + e.getMessage()));
    }

    @PluginMethod
    public void acceptConnection(PluginCall call) {
        String id = call.getString("endpointId");
        if (id == null) { call.reject("endpointId manquant"); return; }
        client().acceptConnection(id, payloadCb)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject("acceptConnection : " + e.getMessage()));
    }

    @PluginMethod
    public void rejectConnection(PluginCall call) {
        String id = call.getString("endpointId");
        if (id != null) client().rejectConnection(id);
        call.resolve();
    }

    /** Envoi d'un petit message (base64) : ~60 par seconde pendant un combat. Pas de réponse attendue côté JS. */
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void sendPayload(PluginCall call) {
        String id = call.getString("endpointId"), data = call.getString("data");
        if (id == null || data == null) return;
        client().sendPayload(id, Payload.fromBytes(Base64.decode(data, Base64.NO_WRAP)));
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        String id = call.getString("endpointId");
        if (id != null) client().disconnectFromEndpoint(id);
        call.resolve();
    }

    @PluginMethod
    public void stopAll(PluginCall call) {
        client().stopAdvertising(); client().stopDiscovery(); client().stopAllEndpoints();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (client != null) { client.stopAdvertising(); client.stopDiscovery(); client.stopAllEndpoints(); }
        super.handleOnDestroy();
    }
}
