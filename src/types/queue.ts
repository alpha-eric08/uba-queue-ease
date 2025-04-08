
export interface QueueEntry {
  id: string;
  name: string;
  phone: string;
  service_type: string;
  branch: string;
  queue_number: string;
  position: number;
  status: string;
  estimated_wait_time: number;
  created_at: string;
}
