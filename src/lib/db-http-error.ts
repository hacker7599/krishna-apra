import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  DB_BUSY_USER_MESSAGE,
  DB_UNAVAILABLE_USER_MESSAGE,
  isTransientDbError,
} from "@/lib/sqlite-resilience";

export type MappedDbError = {
  status: number;
  message: string;
  retryable: boolean;
  code?: string;
};

export function mapDbError(error: unknown): MappedDbError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: 409,
        message: "This email or mobile number is already registered.",
        retryable: false,
        code: error.code,
      };
    }
    if (error.code === "P2025") {
      return {
        status: 404,
        message: "We could not find that record. It may have been removed.",
        retryable: false,
        code: error.code,
      };
    }
    if (error.code === "P2034") {
      return {
        status: 503,
        message: DB_BUSY_USER_MESSAGE,
        retryable: true,
        code: error.code,
      };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      message: DB_UNAVAILABLE_USER_MESSAGE,
      retryable: true,
      code: "P1001",
    };
  }

  if (isTransientDbError(error)) {
    return {
      status: 503,
      message: DB_BUSY_USER_MESSAGE,
      retryable: true,
    };
  }

  return {
    status: 500,
    message: "Something went wrong on our side. Please try again in a moment.",
    retryable: false,
  };
}

export function jsonFromDbError(error: unknown, fallbackMessage?: string): NextResponse {
  const mapped = mapDbError(error);
  const message =
    mapped.status === 500 && fallbackMessage ? fallbackMessage : mapped.message;

  const headers: HeadersInit = {};
  if (mapped.retryable) {
    headers["Retry-After"] = "3";
  }

  return NextResponse.json(
    { error: message, retryable: mapped.retryable },
    { status: mapped.status, headers },
  );
}
