<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 프로젝트: seconds

브라우저에서 최대 30명이 모이는 3D 공간. 텍스트 채팅, 선택적 음성 채팅,
Three.js 구체 캐릭터 이동. **비용 최소화가 최우선이다.**

### 명령어

- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`

### 기술 결정 (비용 최소화 우선)

- 호스팅: Vercel Hobby(무료). 서버리스라 **상시 연결 WebSocket 서버는 두지 않는다.**
- 실시간(채팅 / 구체 위치 / 접속자): **Supabase Realtime** 사용.
  - 채팅·위치 동기화 → Broadcast 채널
  - 접속 인원(최대 30) → Presence
  - 클라이언트에서 anon key로 직접 연결 (별도 백엔드 서버를 만들지 않는다)
- 음성: **WebRTC P2P** (오디오를 브라우저끼리 직접 전송 → 서버 미디어 비용 0).
  - 시그널링(SDP/ICE)은 위 Supabase 채널 재사용
  - STUN은 공개 무료 서버 사용, TURN은 초기엔 생략
  - **근접 음성**: 공간상 가까운 4~6명하고만 연결한다 (메시 과부하 방지)
- 3D: Three.js. 구체 하나 = 사용자 한 명. 위치는 일정 주기로 throttle 후 Broadcast.

### 하지 말 것 (비용·범위 가드레일)

- 유료 SFU / 미디어 서버(LiveKit Cloud, Agora 등) 도입 금지 — 먼저 물어볼 것.
- 30명 음성 전원 동시 메시 연결 금지 (P2P로 못 버틴다).
- 새 유료 서비스나 유료 티어가 필요하면 코드 쓰기 전에 먼저 확인할 것.

### 비밀값

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `.env.local`
- anon key는 공개돼도 안전. service_role 키는 클라이언트에 절대 노출하지 않는다.
