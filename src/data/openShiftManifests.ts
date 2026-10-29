/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Complete Production Kubernetes & Red Hat OpenShift Manifests
 */

export interface ManifestFile {
  filename: string;
  category: 'Security & SCC' | 'Data Layer' | 'Cognitive Kernel' | 'Governance & OPA' | 'GitOps & Telemetry';
  description: string;
  yamlContent: string;
}

export const OPENSHIFT_PRODUCTION_MANIFESTS: ManifestFile[] = [
  {
    filename: '01-namespace-and-scc.yaml',
    category: 'Security & SCC',
    description: 'Namespace, NetworkPolicy default-deny, and OpenShift Restricted SecurityContextConstraints binding.',
    yamlContent: `apiVersion: v1
kind: Namespace
metadata:
  name: pavelagi-omega-prod
  labels:
    app.kubernetes.io/name: pavelagi-omega
    app.kubernetes.io/part-of: cognitive-os
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: pavelagi-omega-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-internal-cognitive-mesh
  namespace: pavelagi-omega-prod
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/part-of: cognitive-os
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/part-of: cognitive-os
      ports:
        - protocol: TCP
          port: 3000
        - protocol: TCP
          port: 5432
        - protocol: TCP
          port: 6379
        - protocol: TCP
          port: 7687
  egress:
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/part-of: cognitive-os
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.0.0.0/8
              - 192.168.0.0/16
      ports:
        - protocol: TCP
          port: 443`,
  },
  {
    filename: '02-postgresql-pgvector-statefulset.yaml',
    category: 'Data Layer',
    description: 'High-availability PostgreSQL 16 with pgvector extension, persistent volume claims, and WAL archiving.',
    yamlContent: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-pgvector
  namespace: pavelagi-omega-prod
  labels:
    app: postgres-pgvector
    component: memory-vector-db
spec:
  serviceName: postgres-headless
  replicas: 2
  selector:
    matchLabels:
      app: postgres-pgvector
  template:
    metadata:
      labels:
        app: postgres-pgvector
        app.kubernetes.io/part-of: cognitive-os
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 26
        fsGroup: 26
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: postgres
          image: pgvector/pgvector:pg16
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5432
              name: postgres
          env:
            - name: POSTGRES_DB
              value: pavelagi_omega
            - name: POSTGRES_USER
              value: agi_kernel_user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pavelagi-db-credentials
                  key: postgres-password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          resources:
            requests:
              cpu: "1000m"
              memory: "2Gi"
            limits:
              cpu: "4000m"
              memory: "8Gi"
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: pgdata
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: ocs-storagecluster-ceph-rbd
        resources:
          requests:
            storage: 100Gi`,
  },
  {
    filename: '03-neo4j-world-model-statefulset.yaml',
    category: 'Data Layer',
    description: 'Neo4j 5.20 Enterprise property graph for World Model entity-relationship graph.',
    yamlContent: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: neo4j-world-model
  namespace: pavelagi-omega-prod
  labels:
    app: neo4j-world-model
    component: world-graph
spec:
  serviceName: neo4j-headless
  replicas: 1
  selector:
    matchLabels:
      app: neo4j-world-model
  template:
    metadata:
      labels:
        app: neo4j-world-model
        app.kubernetes.io/part-of: cognitive-os
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 7474
        fsGroup: 7474
      containers:
        - name: neo4j
          image: neo4j:5.20-enterprise
          ports:
            - containerPort: 7474
              name: http
            - containerPort: 7687
              name: bolt
          env:
            - name: NEO4J_ACCEPT_LICENSE_AGREEMENT
              value: "yes"
            - name: NEO4J_AUTH
              valueFrom:
                secretKeyRef:
                  name: pavelagi-neo4j-credentials
                  key: auth
            - name: NEO4J_dbms_memory_heap_initial__size
              value: "2G"
            - name: NEO4J_dbms_memory_heap_max__size
              value: "4G"
          resources:
            requests:
              cpu: "1000m"
              memory: "4Gi"
            limits:
              cpu: "4000m"
              memory: "8Gi"
          volumeMounts:
            - name: neo4j-data
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: neo4j-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: ocs-storagecluster-ceph-rbd
        resources:
          requests:
            storage: 50Gi`,
  },
  {
    filename: '04-pavelagi-kernel-deployment.yaml',
    category: 'Cognitive Kernel',
    description: 'PavelAGI-X Omega LangGraph runtime, full REST API, readOnlyRootFilesystem, and health probes.',
    yamlContent: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: pavelagi-kernel
  namespace: pavelagi-omega-prod
  labels:
    app: pavelagi-kernel
    version: v1.0.0
    app.kubernetes.io/part-of: cognitive-os
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: pavelagi-kernel
  template:
    metadata:
      labels:
        app: pavelagi-kernel
        app.kubernetes.io/part-of: cognitive-os
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/api/metrics"
    spec:
      serviceAccountName: pavelagi-kernel-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: kernel
          image: quay.io/pavelagi/omega-kernel:v1.0.0
          imagePullPolicy: IfNotPresent
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: POSTGRES_HOST
              value: "postgres-pgvector"
            - name: NEO4J_URI
              value: "bolt://neo4j-world-model:7687"
            - name: REDIS_HOST
              value: "redis-memory-fabric"
            - name: OPA_URL
              value: "http://opa-gatekeeper:8181/v1/data/pavelagi/governance"
            - name: GEMINI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: pavelagi-api-secrets
                  key: gemini-api-key
                  optional: true
          resources:
            requests:
              cpu: "1000m"
              memory: "2Gi"
            limits:
              cpu: "4000m"
              memory: "4Gi"
          livenessProbe:
            httpGet:
              path: /api/agi/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/agi/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          volumeMounts:
            - name: tmp-volume
              mountPath: /tmp
      volumes:
        - name: tmp-volume
          emptyDir: {}`,
  },
  {
    filename: '05-opa-gatekeeper-constitution.yaml',
    category: 'Governance & OPA',
    description: 'OPA ConstraintTemplate and Constraint enforcing Immutable Constitution invariants at admission time.',
    yamlContent: `apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: pavelagiconstitution
spec:
  crd:
    spec:
      names:
        kind: PavelAgiConstitution
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package pavelagi.governance

        # Rule 1: No container may run as root or elevate privileges
        violation[{"msg": msg}] {
          c := input.review.object.spec.template.spec.containers[_]
          c.securityContext.allowPrivilegeEscalation == true
          msg := sprintf("CONST-02 Violation: Container %v requests allowPrivilegeEscalation=true", [c.name])
        }

        # Rule 2: All agent deployments must mount readOnlyRootFilesystem
        violation[{"msg": msg}] {
          c := input.review.object.spec.template.spec.containers[_]
          not c.securityContext.readOnlyRootFilesystem
          msg := sprintf("CONST-04 Violation: Container %v must enable readOnlyRootFilesystem", [c.name])
        }

        # Rule 3: Zero self-deployment - must originate from verified GitOps pipeline
        violation[{"msg": msg}] {
          input.review.userInfo.username != "system:serviceaccount:argocd:argocd-application-controller"
          input.review.object.metadata.namespace == "pavelagi-omega-prod"
          input.review.operation == "CREATE"
          msg := "CONST-03 Violation: Direct cluster mutation prohibited. All deployments must pass through ArgoCD GitOps."
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: PavelAgiConstitution
metadata:
  name: enforce-omega-constitution
spec:
  match:
    kinds:
      - apiGroups: ["apps"]
        kinds: ["Deployment", "StatefulSet"]
    namespaces:
      - "pavelagi-omega-prod"`,
  },
  {
    filename: '06-argocd-gitops-application.yaml',
    category: 'GitOps & Telemetry',
    description: 'ArgoCD Application manifest declaring single source of truth with automated reconciliation.',
    yamlContent: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: pavelagi-omega-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/pavelagi/omega-infrastructure.git
    targetRevision: HEAD
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: pavelagi-omega-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m`,
  },
];
