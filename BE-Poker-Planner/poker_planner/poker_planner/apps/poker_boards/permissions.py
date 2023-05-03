from rest_framework import permissions as rest_permissions


class IsBoardOwner(rest_permissions.BasePermission):
    """
    Pemrission class to check if the request is made by board owner
    """

    def has_object_permission(self, request, view, obj):
        return obj.manager == request.user


class IsBoardMember(IsBoardOwner):
    """
    Pemrission class to check if the request is made by board owner
    or any member associated with the board
    """

    def has_object_permission(self, request, view, obj):
        return (
            super().has_object_permission(request, view, obj)
            or request.user in obj.users.all()
        )
