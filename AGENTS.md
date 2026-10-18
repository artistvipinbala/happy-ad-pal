<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Calculate payment fees through `src/lib/payment-fees.ts` per dated sales row using its recorded sale amount and channel counts; shared rules prevent report drift and preserve historical pricing/FX.
- Daily calculation details consume the daily card's computed metrics and recorded inputs in a read-only dialog; this keeps audit results aligned without introducing separate business logic.
