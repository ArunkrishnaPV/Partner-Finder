-- Run this in the Supabase SQL Editor

-- Students table
CREATE TABLE students (
  uid UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  college TEXT,
  department TEXT,
  year TEXT,
  subjects TEXT[],
  skills TEXT[],
  interests TEXT[],
  "partnerType" TEXT,
  availability JSONB,
  "profileComplete" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "senderId" UUID REFERENCES students(uid),
  "receiverId" UUID REFERENCES students(uid),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  user1 UUID REFERENCES students(uid),
  user2 UUID REFERENCES students(uid),
  participants UUID[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID REFERENCES students(uid),
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (Backend uses Service Role so it bypasses RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile directly if needed from frontend
CREATE POLICY "Users can view own profile." ON students FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update own profile." ON students FOR UPDATE USING (auth.uid() = uid);
