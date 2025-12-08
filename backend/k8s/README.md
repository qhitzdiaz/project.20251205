# Kubernetes Deployment

This directory contains standalone manifests for running the four backend APIs and their PostgreSQL databases on a Kubernetes cluster.

## 1. Build and publish the backend image

All FastAPI services share the same Docker image (`backend/Dockerfile`). Build it and push to a registry that your cluster can pull from, then update the `image:` field in every `backend-*.yaml` file.

```bash
cd backend
docker build -t registry.example.com/qhitz/backend:latest .
docker push registry.example.com/qhitz/backend:latest
```

## 2. Update secrets/config if needed

`backend-secrets.yaml` currently contains the development password/secret (`devpass123`, `dev-secret-key`). Replace these base64-encoded values with production ones:

```bash
echo -n "my-strong-password" | base64
```

Do the same for any other sensitive values you want to manage as secrets.

## 3. Apply the manifests

Create the namespace, configuration, storage, databases, and API deployments:

```bash
kubectl apply -f backend/k8s/namespace.yaml
kubectl apply -f backend/k8s/backend-secrets.yaml
kubectl apply -f backend/k8s/backend-configmap.yaml
kubectl apply -f backend/k8s/persistent-volumes.yaml

# PostgreSQL instances
kubectl apply -f backend/k8s/postgres-auth.yaml
kubectl apply -f backend/k8s/postgres-media.yaml
kubectl apply -f backend/k8s/postgres-cloud.yaml

# FastAPI / Uvicorn services
kubectl apply -f backend/k8s/backend-api.yaml
kubectl apply -f backend/k8s/backend-media.yaml
kubectl apply -f backend/k8s/backend-cloud.yaml
```

Verify pods:

```bash
kubectl get pods -n qhitz-backend
```

Each API has a `Service` of type `LoadBalancer` that exposes ports 5010–5012. Change the service type to `NodePort` or expose them with an Ingress if your cluster does not support external load balancers.

## 4. Persistent data

- PostgreSQL StatefulSets use their own `volumeClaimTemplates`.
- Media/Cloud services mount dedicated PVCs for uploads and storage (`persistent-volumes.yaml`). Ensure your cluster's default `StorageClass` satisfies the requested capacities, or set `storageClassName`.

## 5. Environment variables

- Shared non-sensitive config: `backend-configmap.yaml`.
- Sensitive values: `backend-secrets.yaml`.
- Database URLs and `APP_MODULE`/`APP_PORT` are set explicitly in each deployment manifest to match the docker-compose setup.

Adjust resources, replica counts, probes, and environment variables as needed for your target environment.
