const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function authRefId(req, res, next) {
    try {
        const { userRefId, companyRefId } = req.body;

        if (!companyRefId) {
            return res.status(400).json({ error: "companyRefId bilgisi gereklidir" });
        }

        // First, validate the company using companyRefId
        const companyRef = await prisma.companyRefId.findUnique({
            where: {
                refId: companyRefId,
            },
        });

        if (!companyRef) {
            return res.status(404).json({ error: "Şirket bulunamadı veya verilen refId bu şirkete ait değil" });
        }

        const company = await prisma.company.findUnique({
            where: {
                id: companyRef.companyId,
            },
        });

        let user;

        // If userRefId is provided, validate the user
        if (userRefId) {
            const userRef = await prisma.userRefId.findUnique({
                where: {
                    refId: userRefId,
                },
            });

            if (!userRef) {
                return res.status(404).json({ error: "Kullanıcı bulunamadı veya verilen refId bu kullanıcıya ait değil" });
            }

            user = await prisma.users.findUnique({
                where: {
                    id: userRef.userId,
                },
                include: {
                    UserPermission: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            if (!user.active) {
                return res.status(401).json({ error: 'Bu hesap aktif değil' });
            }

            // Check if the user is a member of the company
            if (user.companyId !== company.id) {
                return res.status(403).json({ error: "Kullanıcı, belirtilen şirketin yetkilisi değil" });
            }
        } else {
            // If userRefId is not provided, use the editor of the company as the user
            user = await prisma.users.findFirst({
                where: {
                    AND: [
                        {
                            role: 'editor',
                        },
                        {
                            companyId: company.id,
                        },
                    ],
                },
                include: {
                    UserPermission: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ error: "Şirketin editörü bulunamadı" });
            }
        }

        if (user.UserPermission) {
            user.permissions = user.UserPermission.map(userPermission => userPermission.permission.name);
        } else {
            user.permissions = [];
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("500 Hatası");
        res.status(500).json({error: error.message});
    }
};
