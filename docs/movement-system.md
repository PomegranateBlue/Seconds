# 이동 시스템 (Milestone 2) — WASD로 구체 움직이기

> 작성: 2026-05-30
>
> 목표: 3D 공간에 놓인 구체를 키보드(WASD/화살표)로 움직인다. 물리엔진(Rapier) 위에서 동작한다.

---

## 1. 무엇을 만들었나 (한 문장)

`<Physics>` 세계 안에 `<RigidBody>`로 만든 구체와 바닥을 두고, `KeyboardControls`가 추적한 키 상태를 `useFrame`에서 매 프레임 읽어 구체에 속도(`setLinvel`)를 직접 적용한다.

현재 동작은 **월드 축 고정** — W는 항상 월드의 −Z 방향. 카메라를 회전시켜도 이동 방향은 안 바뀐다(다음 단계에서 카메라 기준으로 전환 예정).

---

## 2. 관련 파일

| 파일 | 역할 |
|---|---|
| [app/page.tsx](../app/page.tsx) | `<main>`에 `<Scene />` 한 줄 렌더 |
| [app/components/Scene.tsx](../app/components/Scene.tsx) | `<Canvas>`(R3F 무대) + `<Physics>`(물리 세계) + `<KeyboardControls>`(입력 컨텍스트) |
| [app/components/BackgroundMesh.tsx](../app/components/BackgroundMesh.tsx) | 바닥 + 벽 4장. 통째로 `<RigidBody type="fixed">`로 감쌌다 |
| [app/components/Player.tsx](../app/components/Player.tsx) | 구체 1개. `<RigidBody>`로 감싼 mesh + 키 입력 → 속도 적용 로직 |
| [app/lib/KeyMap.ts](../app/lib/KeyMap.ts) | 키 매핑 데이터(`KeyboardMap`) + 키 이름 타입(`ControlName`) |

데이터 흐름:

```
사용자 키 입력
   │
   ▼
<KeyboardControls map={KeyboardMap}>   ← Scene.tsx, Canvas 바깥
   │  (전역 keydown/keyup 청취 → name별 boolean 상태 저장)
   ▼
useKeyboardControls<ControlName>() in Player.tsx
   │  → get() 함수 획득 (현재 상태 즉시 읽기)
   ▼
useFrame(() => { ... })  ← 초당 약 60회
   │  → get()으로 키 상태 확인
   │  → x, z 방향 결정
   ▼
ref.current.setLinvel({ x, y, z }, true)  ← RigidBody에 속도 부여
   │
   ▼
Rapier 시뮬레이션  →  다음 프레임의 위치 결정  →  Three.js mesh 위치 갱신
```

---

## 3. 기술 스택과 필수 지식

### 3.1 Next.js (App Router) — `"use client"` 경계

- App Router는 컴포넌트가 **기본 서버 컴포넌트**다.
- React 훅, 브라우저 API, 이벤트 핸들러를 쓰는 파일은 맨 위에 `"use client"`를 박는다.
- 본 프로젝트에서 `Scene.tsx`, `Player.tsx`는 R3F·drei 훅을 직접 사용 → 둘 다 클라이언트.
- `BackgroundMesh.tsx`는 훅 없이 JSX만 → 서버여도 되지만, 부모(`Scene`)가 클라이언트라 자동으로 클라이언트 번들에 포함된다.

### 3.2 React Three Fiber (R3F) — Three.js를 컴포넌트로

- `<Canvas>` 안의 JSX는 곧 Three.js 씬 그래프다. `<mesh>` ≡ `new THREE.Mesh(...)`.
- 카메라·렌더러·`scene`은 `<Canvas>`가 알아서 만들어주고, 그 안의 컴포넌트가 props로 추가된다.
- `useFrame(cb)` — 매 프레임 콜백 실행. 게임 루프의 핵심.
- `useThree()` — `camera`, `gl`(렌더러), `scene`, `size` 같은 R3F 컨텍스트 객체 접근.

### 3.3 drei — R3F를 위한 유틸 모음

- `<OrbitControls />` — 마우스로 카메라를 궤도 회전시키는 컨트롤. 자유 시점 구현에 사용.
- `<KeyboardControls map={...}>` — 키↔행동 매핑 + 키 상태 저장소(React Context). **`<Canvas>` 바깥에 둬야** 한다(R3F 컨텍스트와 일반 React 컨텍스트는 분리).
- `useKeyboardControls<T>()` — 자식이 키 상태를 읽는 훅. 두 가지 사용법:
  - `const [, get] = useKeyboardControls<T>()` → `get()`은 리렌더 없이 현재 상태만 읽음. **`useFrame` 안에서 이걸 쓴다.**
  - `const v = useKeyboardControls(state => state.forward)` → 셀렉터. 값이 바뀔 때마다 리렌더(UI용).

### 3.4 Rapier (`@react-three/rapier`) — 물리엔진 래퍼

- `<Physics>` — 물리 세계의 루트. 안에 들어간 `<RigidBody>`들끼리 중력·충돌이 적용된다. `debug` 옵션으로 충돌체(collider) 윤곽을 와이어프레임으로 본다.
- `<RigidBody>` — 물리에 참여하는 객체.
  - `type`: `"dynamic"`(기본, 중력 받음) / `"fixed"`(움직이지 않음, 바닥·벽) / `"kinematicPosition"`(내가 좌표 옮기지만 충돌은 일으킴).
  - `colliders`: `"ball"`(구체용), `"cuboid"`(박스용, 기본), `"trimesh"`, `"hull"`, `false`.
  - `position`, `restitution`(반발력) 등 prop으로 초기 상태 지정.
- `RapierRigidBody`(타입) — `ref`에 박는 객체. 주요 메서드:
  - `linvel()` — 현재 선형 속도 `{x, y, z}` 읽기.
  - `setLinvel(v, wakeUp)` — 선형 속도 직접 설정. `wakeUp=true`면 잠든 객체도 깨움.
  - `applyImpulse(v, wakeUp)` — 충격량 적용(누적 효과). 폭발·점프 같은 순간 가속에 쓴다.

### 3.5 TypeScript — 이번에 만난 함정

- **`as const`는 깊게 작동**한다 — 배열·객체 안까지 readonly + 리터럴로 박힌다. 외부 라이브러리(mutable 배열을 요구하는 prop)에 그대로 넘기면 거절당한다.
- 해결: 명시 타입 선언으로 mutable을 명확히 한다. `KeyMap.ts`의 `Entry[]` 패턴이 그 예.
- `useKeyboardControls<T>`의 `T`는 **키 이름 유니온 문자열 타입**이지 결과 객체 타입이 아니다. drei가 내부에서 `{ [K in T]: boolean }`으로 변환해준다.

---

## 4. 씬·카메라·물체의 관계 — 핵심 멘탈 모델

### 4.1 세 가지 좌표계가 동시에 존재한다

이 부분이 이해 안 되면 "카메라를 돌렸을 때 이동 방향이 왜 어색한가"가 영영 안 풀린다.

| 좌표계 | 누구 기준 | 우리 코드에서 |
|---|---|---|
| **월드(World)** | 씬 자체의 절대 기준축. 보통 +Y 위, +X 오른쪽, +Z 카메라 뒤쪽 | `position={[0, 2, 0]}` 같은 모든 prop이 기본은 월드 좌표 |
| **카메라(Camera/View)** | 카메라가 보고 있는 방향이 −Z, 위가 +Y, 오른쪽이 +X | "카메라 기준 전진"은 카메라의 −Z 방향 |
| **로컬(Local/Object)** | 한 물체 자기 자신 기준 | 부모-자식 그룹에서 자식 좌표는 부모 로컬 좌표계 |

### 4.2 현재 우리 이동 코드는 "월드 축 고정"

```ts
const x = (right ? 1 : 0) - (left ? 1 : 0);      // 월드 +X / −X
const z = (backward ? 1 : 0) - (forward ? 1 : 0); // 월드 +Z / −Z
ref.current.setLinvel({ x: x * SPEED, y, z: z * SPEED }, true);
```

- `W`를 누르면 항상 **월드 −Z**로 간다.
- 카메라를 마우스로 빙빙 돌려도 "전진 방향"은 변하지 않는다.
- 처음 정면(카메라가 −Z를 보는 시작 상태)에서는 직관적이지만, 카메라를 90도 돌리면 W가 화면상 "오른쪽"으로 가 보인다.

### 4.3 시점·방향 전환 메커니즘(개념)

"카메라가 보는 쪽으로 W가 전진하게" 하려면 두 단계가 필요하다.

**1단계: 입력 벡터 만들기**
- 키 입력을 **2D 이동 벡터**로 모은다: `input = (x, z)`. 위 코드와 동일.

**2단계: 그 벡터를 "카메라가 보는 평면 좌표계"로 회전**
- 카메라의 **수평 방향**(yaw, Y축 회전 성분만)을 가져온다. 위·아래(pitch)는 무시 — 안 그러면 공중으로 날아간다.
- 그 yaw 각도로 input 벡터를 회전한다.
  - 수식 그림:
    - `cos(θ)` = 카메라가 보는 방향의 X 성분
    - `sin(θ)` = 카메라가 보는 방향의 Z 성분
    - 회전된 입력: `(input.x * cos − input.z * sin, input.x * sin + input.z * cos)`
- Three.js에서는 `camera.getWorldDirection(vec)`로 카메라가 보는 방향 벡터를 얻고, 그것의 `y`를 0으로 만든 뒤 normalize해 쓰면 된다. R3F에서는 `useThree(state => state.camera)`로 카메라를 받는다.

**왜 yaw만 쓰나?**
- 카메라가 바닥을 내려다본 채 W를 누르면, "내가 보는 방향"은 거의 아래쪽이다. 그대로 적용하면 구체가 바닥을 뚫는다.
- 평면 이동은 **수평면 위의 회전**만 고려한다 = yaw만.

### 4.4 시점(view) 자체를 바꾸는 옵션들

| 시점 | 구현 방식 | 특징 |
|---|---|---|
| **자유 시점** | `<OrbitControls />` (현재) | 마우스로 자유 회전·줌. 디버깅·관찰에 좋음. 게임 조작은 어색 |
| **3인칭 추적** | OrbitControls 제거, `useFrame`에서 카메라를 플레이어 뒤쪽 일정 거리에 매 프레임 위치시킴(보간 추천) | 캐릭터 게임에서 가장 흔함. "보는 방향=전진 방향" 자연스러움 |
| **1인칭** | 카메라를 플레이어 위치에 박고(`camera.position = player.position`), 마우스로 회전 | 구체 캐릭터엔 어색. FPS형에 적합 |
| **고정 시점** | 카메라 고정, 플레이어만 움직임 | 보드게임·아이소메트릭 |

본 프로젝트는 일단 자유 시점으로 시작 → 카메라 yaw 기반 이동 → 추후 채팅 UI 잡힌 뒤 시점 재논의.

### 4.5 응용 — 본 프로젝트에 어떻게 확장되나

- **카메라 yaw 기반 이동**: 4.3을 그대로 적용. `Player.tsx`의 `useFrame` 안에서 `useThree`로 받은 camera에서 yaw 추출 후 입력 벡터 회전.
- **다른 플레이어(원격)의 구체**: 위치를 Supabase Broadcast로 받아 `<RigidBody type="kinematicPosition">`로 직접 `setNextKinematicTranslation`. 그쪽은 물리 시뮬레이션 무시, 받은 위치 그대로 표시.
- **장애물 상호작용**: `<RigidBody>`로 감싼 정적·동적 오브젝트를 씬에 추가. 자동 collider가 충돌 처리. 충돌 이벤트가 필요하면 `onCollisionEnter` prop.
- **점프**: 키 매핑에 `jump` 추가 → 키 누른 순간 `applyImpulse({x:0, y:Jump, z:0}, true)`. 단 "땅에 닿았는가" 판정 필요(공중 더블 점프 막기).

---

## 5. 직접 실행 확인 방법

```bash
npm run dev
```

브라우저에서:
1. 구체가 공중에서 떨어져 바닥에 통통 튀며 안착 → 물리엔진 동작 OK.
2. 캔버스를 한 번 클릭(키보드 포커스). W/A/S/D 또는 ↑↓←→ → 구체가 평면에서 미끄러져 이동.
3. 마우스로 카메라를 90도 돌리고 다시 W → **여전히 같은 월드 방향**으로 감 (현재 단계 의도).

`<Physics debug>`가 켜져 있어 바닥·벽·구체의 충돌체(녹색 와이어프레임)가 보인다. 시각 확인 끝나면 `debug` 떼면 된다.

---

## 6. 다음 단계

- [ ] `useThree`로 카메라 가져오기 → yaw 추출 → 입력 벡터 회전 → "카메라 기준 이동" 적용
- [ ] (선택) 점프 키 추가 + 접지 판정
- [ ] (선택) 구체 회전(이동 방향에 맞춰 머리/롤링 방향 표시)
- [ ] 멀티플레이 단계로 가기 전, 시점/카메라 방식 확정

---

## 7. 함정 노트 (이번에 직접 겪은 것들)

1. **`KeyboardControls`는 `<Canvas>` 안에 두면 안 됨** — R3F 컨텍스트 안은 일반 React Context가 자동으로 안 흐른다.
2. **`keys` 배열은 `event.code` 표기** — `"KeyW"`, `"ArrowUp"`. `"w"`나 `"arrowUp"`은 Shift/Caps 등에서 깨진다.
3. **`as const` ↔ 라이브러리 mutable prop 충돌** — 명시 타입 선언이 안전. `[...arr]`는 얕은 복사라 내부 readonly가 남는다.
4. **`useKeyboardControls<T>`의 `T`** — 결과 객체 타입이 아니라 **키 이름 유니온 문자열**.
5. **속도 적용 시 y는 보존** — `setLinvel({x, y:0, z}, true)`로 박으면 중력이 매 프레임 지워져 공이 안 떨어진다. `ref.current.linvel().y`를 그대로 넣는다.
6. **`useFrame` 안에서는 셀렉터 훅 쓰지 말 것** — 매 프레임 리렌더가 일어난다. `get()` 패턴(subscribe 없이 즉시 읽기)을 쓴다.

---

## 8. 한 줄 요약

> **씬 = 좌표계, 카메라 = 그 좌표계를 보는 창, 물체 = 그 좌표계에 놓인 RigidBody.** 입력은 어떤 좌표계 기준으로 해석할지 매번 정해야 한다. 지금은 월드 기준, 다음은 카메라 yaw 기준.
