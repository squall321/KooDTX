/**
 * UploadQueue
 *
 * 업로드 큐 관리 서비스
 * - 업로드 작업 큐잉
 * - 순차 업로드 처리
 * - 실패 재시도
 * - 진행 상태 추적
 */

/**
 * 업로드 작업 타입
 */
export enum UploadTaskType {
  SESSION = 'SESSION',
  SENSOR_DATA = 'SENSOR_DATA',
  AUDIO_FILE = 'AUDIO_FILE',
}

/**
 * 업로드 작업 상태
 */
export enum UploadTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * 업로드 작업
 */
export interface UploadTask {
  id: string;
  type: UploadTaskType;
  status: UploadTaskStatus;
  data: any;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

/**
 * 업로드 핸들러 함수 타입
 */
export type UploadHandler = (task: UploadTask) => Promise<void>;

/**
 * 업로드 진행 상태
 */
export interface UploadProgress {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

/**
 * 업로드 큐 관리 클래스 (Singleton)
 */
export class UploadQueue {
  private static instance: UploadQueue;
  private queue: UploadTask[] = [];
  private handlers: Map<UploadTaskType, UploadHandler> = new Map();
  private isProcessing: boolean = false;
  private maxConcurrentTasks: number = 1;
  private onProgressCallback?: (progress: UploadProgress) => void;

  private constructor() {}

  /**
   * Singleton 인스턴스 가져오기
   */
  public static getInstance(): UploadQueue {
    if (!UploadQueue.instance) {
      UploadQueue.instance = new UploadQueue();
    }
    return UploadQueue.instance;
  }

  /**
   * 업로드 핸들러 등록
   */
  public registerHandler(type: UploadTaskType, handler: UploadHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * 진행 상태 콜백 등록
   */
  public setOnProgressCallback(callback: (progress: UploadProgress) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * 작업 추가
   */
  public async addTask(
    type: UploadTaskType,
    data: any,
    maxRetries: number = 3,
  ): Promise<string> {
    const task: UploadTask = {
      id: this.generateTaskId(),
      type,
      status: UploadTaskStatus.PENDING,
      data,
      retryCount: 0,
      maxRetries,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.queue.push(task);
    this.notifyProgress();

    // 큐 처리 시작
    if (!this.isProcessing) {
      this.processQueue();
    }

    return task.id;
  }

  /**
   * 큐 처리
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const pendingTasks = this.queue.filter(
        (task) => task.status === UploadTaskStatus.PENDING,
      );

      if (pendingTasks.length === 0) {
        break;
      }

      // 최대 동시 작업 수만큼 처리
      const tasksToProcess = pendingTasks.slice(0, this.maxConcurrentTasks);
      await Promise.all(tasksToProcess.map((task) => this.processTask(task)));
    }

    this.isProcessing = false;
    this.notifyProgress();
  }

  /**
   * 작업 처리
   */
  private async processTask(task: UploadTask): Promise<void> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      console.error(`[UploadQueue] No handler registered for task type: ${task.type}`);
      this.updateTaskStatus(task.id, UploadTaskStatus.FAILED, 'No handler registered');
      return;
    }

    try {
      // 작업 상태를 IN_PROGRESS로 변경
      this.updateTaskStatus(task.id, UploadTaskStatus.IN_PROGRESS);

      // 핸들러 실행
      await handler(task);

      // 작업 완료
      this.updateTaskStatus(task.id, UploadTaskStatus.COMPLETED);
      console.log(`[UploadQueue] Task completed: ${task.id}`);
    } catch (error: any) {
      console.error(`[UploadQueue] Task failed: ${task.id}`, error);

      // 재시도 카운트 증가
      task.retryCount++;

      if (task.retryCount < task.maxRetries) {
        // 재시도
        console.log(
          `[UploadQueue] Retrying task: ${task.id} (${task.retryCount}/${task.maxRetries})`,
        );
        this.updateTaskStatus(task.id, UploadTaskStatus.PENDING, error.message);
      } else {
        // 최대 재시도 횟수 초과
        console.error(`[UploadQueue] Task failed after max retries: ${task.id}`);
        this.updateTaskStatus(task.id, UploadTaskStatus.FAILED, error.message);
      }
    }
  }

  /**
   * 작업 상태 업데이트
   */
  private updateTaskStatus(
    taskId: string,
    status: UploadTaskStatus,
    error?: string,
  ): void {
    const task = this.queue.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      if (error) {
        task.error = error;
      }
      this.notifyProgress();
    }
  }

  /**
   * 진행 상태 알림
   */
  private notifyProgress(): void {
    if (this.onProgressCallback) {
      this.onProgressCallback(this.getProgress());
    }
  }

  /**
   * 진행 상태 가져오기
   */
  public getProgress(): UploadProgress {
    const totalTasks = this.queue.length;
    const completedTasks = this.queue.filter(
      (task) => task.status === UploadTaskStatus.COMPLETED,
    ).length;
    const failedTasks = this.queue.filter(
      (task) => task.status === UploadTaskStatus.FAILED,
    ).length;
    const inProgressTasks = this.queue.filter(
      (task) => task.status === UploadTaskStatus.IN_PROGRESS,
    ).length;
    const pendingTasks = this.queue.filter(
      (task) => task.status === UploadTaskStatus.PENDING,
    ).length;

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      inProgressTasks,
      pendingTasks,
    };
  }

  /**
   * 완료된 작업 제거
   */
  public clearCompleted(): void {
    this.queue = this.queue.filter(
      (task) => task.status !== UploadTaskStatus.COMPLETED,
    );
    this.notifyProgress();
  }

  /**
   * 실패한 작업 재시도
   */
  public retryFailed(): void {
    this.queue.forEach((task) => {
      if (task.status === UploadTaskStatus.FAILED) {
        task.status = UploadTaskStatus.PENDING;
        task.retryCount = 0;
        task.error = undefined;
        task.updatedAt = Date.now();
      }
    });

    this.notifyProgress();

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * 큐 초기화
   */
  public clear(): void {
    this.queue = [];
    this.notifyProgress();
  }

  /**
   * 작업 ID 생성
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 큐 상태 가져오기
   */
  public getQueue(): UploadTask[] {
    return [...this.queue];
  }

  /**
   * 작업 가져오기
   */
  public getTask(taskId: string): UploadTask | undefined {
    return this.queue.find((task) => task.id === taskId);
  }

  /**
   * 작업 제거
   */
  public removeTask(taskId: string): void {
    this.queue = this.queue.filter((task) => task.id !== taskId);
    this.notifyProgress();
  }

  /**
   * 큐 처리 일시 정지
   */
  public pause(): void {
    this.isProcessing = false;
  }

  /**
   * 큐 처리 재개
   */
  public resume(): void {
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
}

/**
 * 업로드 큐 인스턴스 가져오기
 */
export function getUploadQueue(): UploadQueue {
  return UploadQueue.getInstance();
}
