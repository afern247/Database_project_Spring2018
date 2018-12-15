use henrybookstore;

# Allow users to search for books by title and then show the inventory availability for such book,
# branch(es) where available, along with author and publisher information related to the books satisfying
# the title searched for.

select
   title,
   publisherName,
   branchName,
   OnHand,
   copyNum,
   quality,
   authorFirst,
   authorLast
from
   book as bk
   join wrote as wrt on wrt.bookCode = bk.bookCode
   join author as atr on atr.authorNum = wrt.authorNum
   join copy as cp on cp.bookCode = bk.bookCode
   join branch as br on br.branchNum = cp.branchNum
   join inventory as inv on inv.BookCode = cp.bookCode
   join publisher as ph on ph.publisherCode = bk.publisherCode
   
where
   title like '%brother%'  # here I just need to put a variable to remplace the word mice... to search anything that I need.
order by 
   title,
   sequence;
   