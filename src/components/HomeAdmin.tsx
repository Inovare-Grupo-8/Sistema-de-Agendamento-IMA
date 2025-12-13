import { Button } from "@/components/ui/button";
// HomeAdmin foi removido. O fluxo de Administrador agora usa o painel de Assistente Social
// para manter rotas e permissões consistentes.

import React from "react";

const HomeAdmin: React.FC = () => {
  return null;
};

export default HomeAdmin;
              <DialogDescription>
                Tem certeza que deseja sair da sua conta?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              {" "}
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-[#ED4231] hover:bg-[#D63A2A] text-white font-medium"
              >
                Sair
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default HomeAdmin;
