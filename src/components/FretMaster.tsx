// Re-export the full FretMaster app
import FretMasterApp from '../fretmaster/FretMasterApp'

export function FretMaster({ initialCatalogScale }: { initialCatalogScale?: number | null }) {
  return <FretMasterApp initialCatalogScale={initialCatalogScale} />
}
