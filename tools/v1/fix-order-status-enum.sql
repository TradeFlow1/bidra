select status::text as status, count(*)::int as count
from "Order"
group by status
order by status;

update "Order"
set status = 'PENDING'
where status in ('PICKUP_REQUIRED', 'PICKUP_SCHEDULED');

select status::text as status, count(*)::int as count
from "Order"
group by status
order by status;