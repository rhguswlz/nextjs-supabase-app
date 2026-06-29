# 프로필 테이블 사용 가이드

## 📚 개요

프로필 테이블은 Supabase 인증 시스템과 연동되어 회원가입한 사용자의 정보를 관리하는 테이블입니다.

## 📋 테이블 구조

### 컬럼

| 컬럼명       | 타입      | 설명                                  | 필수여부 |
| ------------ | --------- | ------------------------------------- | -------- |
| `id`         | UUID      | Supabase Auth 사용자 ID (Primary Key) | ✅       |
| `email`      | TEXT      | 사용자 이메일 (고유값)                | ✅       |
| `full_name`  | TEXT      | 사용자 이름                           | ❌       |
| `avatar_url` | TEXT      | 프로필 이미지 URL                     | ❌       |
| `bio`        | TEXT      | 자기소개                              | ❌       |
| `created_at` | TIMESTAMP | 프로필 생성일시                       | ✅       |
| `updated_at` | TIMESTAMP | 프로필 수정일시 (자동 업데이트)       | ✅       |

### 특징

- ✅ **Row Level Security (RLS)**: 사용자는 자신의 프로필만 조회/수정 가능
- ✅ **자동 트리거**: `updated_at` 필드는 수정 시 자동으로 업데이트됨
- ✅ **인덱스**: 이메일과 생성일시에 인덱스 생성으로 쿼리 성능 최적화
- ✅ **외래키 제약**: 사용자 삭제 시 프로필도 자동 삭제

## 🚀 사용 방법

### 1. TypeScript 타입 사용

```typescript
import { Profile, ProfileInsert, ProfileUpdate } from "@/lib/database.types";

// 프로필 데이터
const profile: Profile = {
  id: "user-id",
  email: "user@example.com",
  full_name: "홍길동",
  avatar_url: null,
  bio: "안녕하세요",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 신규 프로필 생성
const newProfile: ProfileInsert = {
  id: "user-id",
  email: "user@example.com",
  full_name: "홍길동",
};

// 프로필 업데이트
const updates: ProfileUpdate = {
  full_name: "김길동",
  bio: "업데이트된 자기소개",
};
```

### 2. 프로필 서비스 사용

```typescript
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByEmail,
} from "@/lib/services/profile.service";

// 프로필 조회 (사용자 ID로)
const profile = await getProfile("user-id");

// 프로필 생성
const newProfile = await createProfile({
  id: "user-id",
  email: "user@example.com",
  full_name: "홍길동",
});

// 프로필 업데이트
const updated = await updateProfile("user-id", {
  bio: "새로운 자기소개",
});

// 프로필 삭제
await deleteProfile("user-id");

// 이메일로 프로필 조회
const profileByEmail = await getProfileByEmail("user@example.com");
```

### 3. React Hook 사용 (클라이언트 컴포넌트)

```typescript
'use client'

import { useProfile } from '@/lib/hooks/useProfile'

export default function ProfilePage() {
  const { profile, isLoading, error, updateUserProfile } = useProfile()

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>
  if (!profile) return <div>프로필이 없습니다</div>

  const handleUpdate = async () => {
    try {
      await updateUserProfile({
        bio: '새로운 자기소개',
      })
      alert('프로필이 업데이트되었습니다')
    } catch (error) {
      alert('프로필 업데이트 실패')
    }
  }

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>{profile.email}</p>
      <p>{profile.bio}</p>
      <button onClick={handleUpdate}>프로필 업데이트</button>
    </div>
  )
}
```

## 📝 회원가입 플로우

회원가입 시 Supabase Auth 사용자 생성 후 프로필을 함께 생성합니다:

```typescript
import { createClient } from "@/lib/supabase/client";
import { createProfile } from "@/lib/services/profile.service";

async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();

  // 1. Supabase Auth에 사용자 등록
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("사용자 생성 실패");

  // 2. 프로필 생성
  const profile = await createProfile({
    id: authData.user.id,
    email,
    full_name: fullName,
  });

  return profile;
}
```

## 🔒 보안 (Row Level Security)

프로필 테이블은 RLS가 활성화되어 있어 다음 규칙을 따릅니다:

- 사용자는 자신의 프로필(`id = auth.uid()`)만 조회 가능
- 사용자는 자신의 프로필만 수정 가능
- 사용자는 자신의 프로필만 삭제 가능
- 인증된 사용자는 프로필 생성 가능

## ⚠️ 주의사항

1. **프로필 삭제**: 사용자가 Supabase Auth에서 삭제되면 프로필도 자동 삭제됩니다
2. **이메일 중복**: 이메일은 고유값이므로 중복 불가능
3. **권한 확인**: 클라이언트 작업 시 RLS 정책에 따라 접근 권한이 제한됩니다
4. **서버 사이드**: 서버에서는 서비스 키를 사용하여 RLS 제한을 우회할 수 있습니다

## 🔗 관련 파일

- **타입 정의**: `lib/database.types.ts`
- **서비스**: `lib/services/profile.service.ts`
- **Hook**: `lib/hooks/useProfile.ts`, `lib/hooks/useAuth.ts`
- **마이그레이션**: `supabase/migrations/0001_create_profiles_table.sql`
