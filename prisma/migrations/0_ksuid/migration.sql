-- CreateExtension
-- Install `pgcrypto` module
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/**
 * Returns a Segment's KSUID with microsecond precision.
 * 
 * -------------------------------
 * Structure
 * -------------------------------
 *  2HiFJ Omk JQ0tyawHfJwUJO9IomG
 *    ^    ^    ^
 *    |    |    |
 *    |    |    +-- random (108b)
 *    |    +------- micros  (20b)
 *    +----------- seconds  (32b)
 * -------------------------------
 * 
 * Use COLLATE "C" or COLLATE "POSIX" on column to sort by ASCII order.
 * "The C and POSIX collations both specify “traditional C” behavior, in
 * which only the ASCII letters “A” through “Z” are treated as letters, 
 * and sorting is done strictly by character code byte values."
 * Source: https://www.postgresql.org/docs/current/collation.html
 *
 * Reference implementation: https://github.com/segmentio/ksuid
 * Also read: https://segment.com/blog/a-brief-history-of-the-uuid/
 */
create or replace function ksuid_pgcrypto_micros() returns text as $$
declare
	v_time timestamp with time zone := null;
	v_seconds numeric(50) := null;
	v_micros numeric(50)  := null;
	v_numeric numeric(50) := null;
	v_epoch numeric(50) = 1400000000; -- 2014-05-13T16:53:20Z
	v_payload bytea := null;
	v_base62 text := '';
	v_alphabet char array[62] := array[
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
		'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
		'U', 'V', 'W', 'X', 'Y', 'Z', 
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
		'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
		'u', 'v', 'w', 'x', 'y', 'z'];
	i integer := 0;
begin

	-- Get the current time
	v_time := clock_timestamp();

	-- Extract the epoch seconds and microseconds
	v_seconds := EXTRACT(EPOCH FROM v_time) - v_epoch;
	v_micros  := MOD((EXTRACT(microseconds FROM v_time)::numeric(50)), 1e6::numeric(50));

	-- Generate a KSUID in a numeric variable
	v_numeric := (v_seconds * pow(2::numeric(50), 128))  -- 32 bits for seconds
		+ (v_micros  * pow(2::numeric(50), 108));        -- 20 bits for microseconds

	-- Add 108 random bits to it
	v_payload := gen_random_bytes(14);
	v_payload := set_byte(v_payload::bytea, 0, get_byte(v_payload, 0) >> 4);
	while i < 14 loop
		i := i + 1;
		v_numeric := v_numeric + (get_byte(v_payload, i - 1)::numeric(50) * pow(2::numeric(50), (14 - i) * 8));
	end loop;

	-- Encode it to base-62
	while v_numeric <> 0 loop
		v_base62 := v_base62 || v_alphabet[mod(v_numeric, 62) + 1];
		v_numeric := div(v_numeric, 62);
	end loop;
	v_base62 := reverse(v_base62);
	v_base62 := lpad(v_base62, 27, '0');

	return v_base62;
	
end $$ language plpgsql;

-- EXAMPLE:
-- select ksuid_pgcrypto_micros() ksuid, clock_timestamp()-statement_timestamp() time_taken;

-- EXAMPLE OUTPUT:
-- |ksuid                      |time_taken     |
-- |---------------------------|---------------|
-- |2HeIj5n6zGw76bbU6FCvHv0DQ16|00:00:00.000542|

-------------------------------------------------------------------
-- FOR TEST: the expected result is an empty result set
-------------------------------------------------------------------
-- with t as (
--     select ksuid_pgcrypto_micros() as id from generate_series(1, 1000)
-- )
-- select * from t where (id is null or not id ~ '^[a-zA-Z0-9]{27}$');
