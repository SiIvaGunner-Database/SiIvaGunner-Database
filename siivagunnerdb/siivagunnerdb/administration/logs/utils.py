"""
Utilities for easily creating LogEntry objects. Experimental and incomplete.
"""

from django.contrib.admin.models import CHANGE, ADDITION
from django.contrib.admin.options import ModelAdmin
from django.contrib.admin.utils import construct_change_message


def log_addition(request, object):
    """
    Creates an addition LogEntry.
    """
    message = [{"added": {}}]
    ModelAdmin.log_addition(None, request, object, message)


def log_change(request, old_object, new_object):
    """
    Creates a change LogEntry.
    """
    message = [{"changed": {}}]
    ModelAdmin.log_change(None, request, new_object, message)
