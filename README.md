---

# CI/CD Documentation

## 1. CI Secrets: Storage and Usage

CI secrets are **sensitive credentials** required during automated builds and deployments. These secrets must never be hard-coded in source code.

### 1.1 Where Secrets Are Stored

All secrets are securely stored in **GitHub Actions → Repository Secrets**.

Path:

```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

Secrets are:

* Encrypted at rest
* Masked in logs
* Accessible only at runtime

---

### 1.2 Registry Credentials (DockerHub)

#### Required Secrets

| Secret Name       | Description                           |
| ----------------- | ------------------------------------- |
| `DOCKER_USERNAME` | DockerHub username                    |
| `DOCKER_PASSWORD` | DockerHub Access Token (NOT password) |

#### How They Are Used

In GitHub Actions, credentials are injected as environment variables and used to authenticate Docker:

```yaml
- name: Login to DockerHub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

This allows the pipeline to:

* Build Docker images
* Push images to DockerHub securely

---

### 1.3 Kubernetes Kubeconfig

#### Required Secret

| Secret Name      | Description                    |
| ---------------- | ------------------------------ |
| `KUBECONFIG_DEV` | Base64-encoded kubeconfig YAML |

#### How It Is Used

The kubeconfig is injected during deployment to authenticate `kubectl`:

```yaml
- name: Setup kubeconfig
  run: |
    echo "${{ secrets.KUBECONFIG_DEV }}" | base64 -d > kubeconfig
    export KUBECONFIG=$PWD/kubeconfig
```

This allows GitHub Actions to:

* Access the Kubernetes cluster
* Deploy workloads
* Perform rollouts and rollbacks

---

## 2. Rollback Strategy

If a deployment fails or causes issues, we use **two rollback mechanisms**.

---

## 2.1 Rollback Using Previous Image Tag

### Strategy

Each deployment uses **versioned Docker images** (commit SHA or semantic version).

Example:

```yaml
image: riazul/backend:1.0.3
```

### Rollback Steps

1. Identify the last working image tag
2. Update deployment YAML:

```bash
kubectl set image deployment/backend backend=riazul/backend:1.0.2
```

3. Verify rollout:

```bash
kubectl rollout status deployment/backend
```

### Advantages

* Very fast rollback
* No dependency on Kubernetes history

---

## 2.2 Kubernetes Native Rollback (`rollout undo`)

### Strategy

Kubernetes keeps **revision history** of Deployments.

### Rollback Steps

```bash
kubectl rollout undo deployment/backend -n dev
```

Or rollback to a specific revision:

```bash
kubectl rollout undo deployment/backend --to-revision=2 -n dev
```

### Verify

```bash
kubectl rollout status deployment/backend -n dev
kubectl rollout history deployment/backend -n dev
```

### Advantages

* Zero YAML changes
* Built-in safety
* Production-grade

---

